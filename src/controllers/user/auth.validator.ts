import validator, { Joi } from 'koa-context-validator';

export const loginValidator = validator({
    body: Joi.object().keys({
        username: Joi.string().required()
            .min(3, 'utf-8').max(20, 'utf-8'),
        password: Joi.string().required(),
    }).required().label("username and password"),
})

export const signupValidator = validator({
    body: Joi.object().keys({
        username: Joi.string().required()
            .min(3, 'utf-8').max(20, 'utf-8'),
        password: Joi.string().required()
            .min(8, 'utf-8').required()
    }).required().label("username"),
})
