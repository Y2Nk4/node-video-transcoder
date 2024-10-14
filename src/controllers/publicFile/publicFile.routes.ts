import router from 'koa-router';
import { DefaultState } from 'koa';
import serve from "koa-static";
import { ServerContext } from "../../types/ServerTypes";
import path from "node:path";

const route = new router<DefaultState, ServerContext>();

const staticPath = path.resolve(process.env.PUBLIC_OUTPUT_PATH || 'output');
console.log('staticPath->', staticPath);
route.get('/video/(.*)', readPathFromParam, serve(process.env.PUBLIC_OUTPUT_PATH || 'output'));

export default route;

async function readPathFromParam(ctx: ServerContext, done: any) {
    ctx.path = ctx.params['0'];
    await done()
}
