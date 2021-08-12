import argon2 from 'argon2';
import {
    Arg,
    Ctx,
    Field,
    Mutation,
    ObjectType,
    Query,
    Resolver,
} from 'type-graphql';
import { v4 } from 'uuid';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants';
import { User } from '../entities/User';
import { MyContext } from '../types';
import { RegisterInput } from '../utils/RegisterInput';
import { sendEail } from './../utils/sendEmail';
import { validateRegister } from './../utils/validateRegister';

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(@Ctx() { em, req }: MyContext) {
        if (!req.session.userId) {
            return null;
        }

        const user = await em.findOne(User, { id: req.session.userId });
        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: RegisterInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const errors = await validateRegister(em, options);
        if (errors) {
            return { errors };
        }

        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, {
            email: options.email,
            username: options.username,
            password: hashedPassword,
        });
        try {
            await em.persistAndFlush(user);
        } catch (error) {
            console.error(error.message);
        }

        // Store user cookie
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(
            User,
            usernameOrEmail.includes('@')
                ? {
                      email: usernameOrEmail,
                  }
                : {
                      username: usernameOrEmail,
                  }
        );

        if (!user) {
            return {
                errors: [
                    {
                        field: 'usernameOrEmail',
                        message: 'Invalid credentials',
                    },
                ],
            };
        }

        const verify = await argon2.verify(user.password, password);

        if (!verify) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'Invalid credentials',
                    },
                ],
            };
        }

        // Store user cookie
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
        return new Promise((resolve) =>
            req.session.destroy((err) => {
                res.clearCookie(COOKIE_NAME);
                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }
                resolve(true);
            })
        );
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { em, redis }: MyContext
    ) {
        const user = await em.findOne(User, { email });
        if (!user) {
            return true; // security purposes
        }

        const token: string = v4();

        await redis.set(
            FORGOT_PASSWORD_PREFIX + token,
            user.id,
            'ex',
            1000 * 60 * 60
        );

        sendEail(
            email,
            `<a href="http://localhost:3000/chage-password/${token}">Reset password</a>`
        );
        return true;
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { em, redis, req}: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 2) {
            return {
                errors: [
                    {
                        field: 'newPassword',
                        message: 'password lenght must be greater that 2.',
                    },
                ],
            };
        }

        const key = FORGOT_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);

        if (!userId) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'invalid token',
                    },
                ],
            };
        }

        const user = await em.findOne(User, { id: parseInt(userId) });

        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'user no longer exist',
                    },
                ],
            };
        }

        user.password = await argon2.hash(newPassword);
        try {
            await em.persistAndFlush(user);
        } catch (error) {
            console.error(error.message);
        }

        redis.del(key)
        // Login user after change password
        req.session.userId = user.id

        return {user}
    }
}
