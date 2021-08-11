import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core';
import { User } from './../entities/User';
import { RegisterInput } from './RegisterInput';

export const validateRegister = async (
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>,
    options: RegisterInput
) => {
    if (options.username.length <= 2) {
        return [
            {
                field: 'username',
                message: 'Username lenght must be greater that 2.',
            },
        ];
    }

    if (options.username.includes('@')) {
        return [
            {
                field: 'username',
                message: 'invalid email, canot include an @.',
            },
        ];
    }

    if (!options.email.includes('@')) {
        return [
            {
                field: 'email',
                message: 'invalid email',
            },
        ];
    }

    if (options.password.length <= 2) {
        return [
            {
                field: 'password',
                message: 'password lenght must be greater that 2.',
            },
        ];
    }

    const existingUser = await em.findOne(User, {
        username: options.username,
    });

    if (existingUser) {
        return [
            {
                field: 'username',
                message: 'Username already taken.',
            },
        ];
    }

    return null;
};
