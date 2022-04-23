import { MikroORM } from '@mikro-orm/core';
import 'dotenv/config';
import { __prod__, __PORT__ } from './constants';
import mikroConfig from './mikro-orm.config'
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { createClient } from 'redis';

const start = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = createClient({ legacyMode: true });
    redisClient.connect().catch(console.error);

    redisClient.on("error", (err) => console.error("Redis error", err));

    app.use(
        session({
            name: "qid",
            store: new RedisStore({
                client: redisClient as any
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: "lax", // csrf
                // secure: __prod__, // cookie only works in https
            },
            saveUninitialized: false,
            secret: "secret",
            resave: false,
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,

        }),
        // context is accesible by all resolvers
        context: ({ req, res }) => ({ em: orm.em, req, res })
    })

    await apolloServer.start();
    apolloServer.applyMiddleware({ app });

    app.listen(__PORT__, () => {
        console.log("server listening on port", __PORT__)
    })
}

start().catch(err => {
    console.error(err);
});
