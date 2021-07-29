import {
    Ctx,
    Arg,
    Resolver,
    // Query,
    // Int,
    InputType,
    Mutation,
    Field,
    ObjectType,
} from 'type-graphql';
import argon2 from 'argon2';
import { User } from '../entities/User';
import { MyContext } from './../types';

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
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
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
        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
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

        await em.persistAndFlush(user);
        return { user };
    }
}
