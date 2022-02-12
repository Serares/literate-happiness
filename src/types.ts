import {EntityManager, Connection, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from "express";

declare module 'express-session' {
    export interface Session {
        user: {[key: string]: any}
    }
}

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>,
    req: Request & {session: {userId: string | number}},
    res: Response
}
