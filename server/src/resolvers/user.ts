import {
    Ctx,
    Arg,
    Resolver,
    Query,
    // Int,
    InputType,
    Mutation,
    Field,
    ObjectType,
} from 'type-graphql';
import argon2 from 'argon2';
import { User } from '../entities/User';
import { MyContext } from '../types';
import { COOKIE_NAME } from '../constants';

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    password: string;
}

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
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'Username lenght must be greater that 2.',
                    },
                ],
            };
        }

        if (options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'password lenght must be greater that 2.',
                    },
                ],
            };
        }

        const existingUser = await em.findOne(User, {
            username: options.username,
        });

        if (existingUser) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'Username already taken.',
                    },
                ],
            };
        }

        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, {
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
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, {
            username: options.username,
        });

        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'Invalid credentials',
                    },
                ],
            };
        }

        const verify = await argon2.verify(user.password, options.password);

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
