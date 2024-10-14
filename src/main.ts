import koa from 'koa';
import koaBody from 'koa-body';
import 'dotenv/config';
import * as responseUtils from "./utils/responseUtil";
import jwt from 'koa-jwt'

import './bootstrap/default';
import logger from './bootstrap/logger';
import routes from './routes/router';
import {ServerContext} from './types/ServerTypes';
import ValidationErrorHandler from './middlewares/ValidationErrorHandler';
import Service from "./service/services";

const app = new koa();
const service = new Service();

app.use(async function (ctx, next) {
        ctx.service = service
        await next();
    })
    .use(koaBody({ multipart: true }))
    .use(async function (ctx: ServerContext, next) {
        ctx.success = responseUtils.success.bind(ctx)
        ctx.error = responseUtils.error.bind(ctx)
        await next()
    })
    .use(ValidationErrorHandler)
    .use(jwt({ secret: process.env.JWT_SECRET || 'secret', passthrough: true }))
    .use(routes.routes())

app.listen(process.env.SERVER_PORT, () => {
    logger.info(`Video Transcoder backend is listening at ${process.env.SERVER_PORT}`);
})
