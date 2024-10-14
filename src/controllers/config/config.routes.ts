import router from 'koa-router';
import * as configController from './config.controller';
import { DefaultState } from 'koa';
import { ServerContext } from "../../types/ServerTypes";
import { getConfigValidator, updateConfigValidator } from "./config.validator";

const route = new router<DefaultState, ServerContext>();

route.get('/:key', getConfigValidator, configController.getConfig)
route.post('/:key', updateConfigValidator, configController.updateConfig)
route.put('/:key', updateConfigValidator, configController.createConfig)

export default route;
