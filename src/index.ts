import { MikroORM } from '@mikro-orm/core';
import { __prod__, __PORT__ } from './constants';
import { Post } from './entities/Post';
import mikroConfig from './mikro-orm.config'
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';

const app = express();

app.get("/", (_, res) => {
    res.send({ "hello": "hy" })
})


const start = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver],
            validate: false
        })
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
