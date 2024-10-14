import {ValidationError} from 'joi';
import { ServerContext } from "../types/ServerTypes";
import { Next } from "koa";

export default async (ctx: ServerContext, next: Next) => {
    try {
        await next();
    } catch (err: any) {
        if (err instanceof ValidationError) {
            console.log(err)
            ctx.error(err.message.replace(/"/g, ''), 400);
            return;
        }
        throw err;
    }
}
