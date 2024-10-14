import User from "../models/user";
import jwt from 'jsonwebtoken';

export default class Auth {
    generateToken(user: User) {
        return jwt.sign({
            id: user.id,
            username: user.username
        }, process.env.JWT_SECRET || 'secret')
    }
}
