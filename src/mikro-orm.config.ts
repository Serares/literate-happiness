import { MikroORM } from "@mikro-orm/core";
import { __DB_NAME__, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import path from 'path';
import { User } from "./entities/User";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: "/^[\w-]+\d+\.[tj]s$/"
    },
    entities: [Post, User],
    dbName: __DB_NAME__,
    password: "Pass2020!",
    type: 'postgresql',
    allowGlobalContext: true,
    debug: !__prod__
} as Parameters<typeof MikroORM.init>[0];
