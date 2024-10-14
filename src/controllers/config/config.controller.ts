import {ServerContext} from "../../types/ServerTypes";
import Config from "../../models/config";

export async function getConfig(ctx: ServerContext) {
    const configValue: any | null = await Config.getConfig(ctx.params.key);

    if (configValue == null) {
        return ctx.error({ error: 'Config not found' }, 404);
    } else {
        return ctx.success(configValue);
    }
}

interface UpdateConfigFields {
    value: string;
}

export async function updateConfig(ctx: ServerContext) {
    const body: UpdateConfigFields = ctx.request.body as UpdateConfigFields;
    const configValue: any | null = await Config.updateConfig(ctx.params.key, body.value);

    if (configValue == null) {
        return ctx.error({ error: 'Config not found' }, 404);
    } else {
        return ctx.success(configValue);
    }
}

export async function createConfig(ctx: ServerContext) {
    const body: UpdateConfigFields = ctx.request.body as UpdateConfigFields;
    const configValue: any | null = await Config.createConfig(ctx.params.key, body.value);

    return ctx.success(configValue);
}
