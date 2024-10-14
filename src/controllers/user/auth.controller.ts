import { ServerContext } from '../../types/ServerTypes';
import User from '../../models/user';
import bcrypt from 'bcrypt';

interface LoginFields {
    username: string;
    password: string;
}
export async function login (ctx: ServerContext) {
    const body = ctx.request.body as LoginFields;

    let user: User | null = await User.findOne({ where: { username: body.username } });

    if (user == null) {
        return ctx.error("Username and password do not match");
    }

    if (!bcrypt.compareSync(body.password, user.password)) {
        return ctx.error("Username and password do not match");
    }

    const token: string = ctx.service.auth.generateToken(user);

    return ctx.success({ token });
}

interface SignUpFields {
    username: string;
    password: string;
    email: string;
    fullName: string;
}
export async function signup(ctx: ServerContext) {
    const body = ctx.request.body as SignUpFields;

    let user: User | null = await User.findOne({ where: { username: body.username } });

    if (user !== null) {
        return ctx.error("Username is already taken");
    }

    user = await User.create({
        username: body.username,
        password: bcrypt.hashSync(body.password, bcrypt.genSaltSync(3))
    })
}
