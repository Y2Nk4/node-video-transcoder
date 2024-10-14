import { Context } from 'koa';
import * as responseUtils from "../utils/responseUtil";
import Service from "../service/services";
import User from "../models/user";

export interface ServerContext extends Context {
    success: responseUtils.ResponseUtilFn,
    error: responseUtils.ResponseUtilFn,
    service: Service,
    loggedUser: User
}

