import express from 'express';
import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { __prod__ } from './constants';
import mikroConfig from './mikro-orm.config';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';

const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false,
        }),
        context: () => ({ em: orm.em }),
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
    // app.get('/', (_, res) => {
    //     res.send('HELLLOOOOO');
    // });

    app.listen(4000, () => {
        console.log('Listening on localhost:4000');
    });
};

main().catch((err) => console.error(err));
