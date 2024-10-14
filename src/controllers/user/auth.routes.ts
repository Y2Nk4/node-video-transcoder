import router from 'koa-router';
import * as authController from './auth.controller';
import { DefaultState } from 'koa';
import { ServerContext } from "../../types/ServerTypes";
import { loginValidator, signupValidator } from "./auth.validator";

const route = new router<DefaultState, ServerContext>();

route.post('/login', loginValidator, authController.login)
route.post('/signup', signupValidator, authController.signup)

export default route;
