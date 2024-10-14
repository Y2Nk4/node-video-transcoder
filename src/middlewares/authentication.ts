import {ServerContext} from "../types/ServerTypes";
import {JWTPayload} from "../types/JWTTokenTypes";
import User from "../models/user";

export default function () {
    return async (ctx: ServerContext, next: any) => {
        const authPayload: JWTPayload = ctx.state.user as JWTPayload;

        if (authPayload == null) {
            return ctx.error({ error: 'Unauthorized' }, 401);
        } else {
            if (authPayload.id) {
                const user: User | null = await User.findOne({ where: { id: authPayload.id }});

                if (user == null) {
                    return ctx.error({ error: 'Unauthorized' }, 401);
                } else {
                    ctx.loggedUser = user;
                    await next();
                }
            }
        }
    }
}
