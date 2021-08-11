import { validateRegister } from './../utils/validateRegister';
import {
    Ctx,
    Arg,
    Resolver,
    Query,
    Mutation,
    Field,
    ObjectType,
} from 'type-graphql';
import argon2 from 'argon2';
import { User } from '../entities/User';
import { MyContext } from '../types';
import { COOKIE_NAME } from '../constants';
import { RegisterInput } from '../utils/RegisterInput';

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
            return {errors}
        };

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
}
