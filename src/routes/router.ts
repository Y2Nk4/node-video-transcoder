import router from 'koa-router';
import { DefaultState } from "koa";
import { ServerContext } from "../types/ServerTypes";
import authentication from "../middlewares/authentication";
import authRoutes from '../controllers/user/auth.routes';
import configRoutes from "../controllers/config/config.routes";
import publicFileRoutes from "../controllers/publicFile/publicFile.routes";

const routes = new router<DefaultState, ServerContext>();

routes.use('/user/auth', authRoutes.routes())
routes.use('/config', authentication(), configRoutes.routes())
routes.use('/public', publicFileRoutes.routes())

export default routes;
