import express from 'express';
import 'reflect-metadata'; // For TypeORM
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from './types';
import { COOKIE_NAME, __prod__ } from './constants';
import { createConnection } from 'typeorm';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import cors from 'cors';
import { User } from './entities/User';
import { Post } from './entities/Post';
import { Updoot } from './entities/Updoot';
import path from 'path';

const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        username: 'postgres',
        password: '',
        database: 'lireddit2',
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [User, Post, Updoot],
    });

    await conn.runMigrations();

    // await Post.delete({})

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis();

    app.use(
        cors({
            origin: 'http://localhost:3000',
            credentials: true,
        })
    );

    // TODO Set new secret, this is just fot development
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                // disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: 'lax', // csrf
                secure: __prod__, // https...
            },
            saveUninitialized: false,
            secret: 'mySecret',
            resave: false,
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }): MyContext => ({ req, res, redis }),
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });

    app.listen(4000, () => {
        console.log('Listening on localhost:4000');
    });
};

main().catch((err) => console.error(err));
