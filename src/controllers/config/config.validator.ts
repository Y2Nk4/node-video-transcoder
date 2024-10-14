import validator, { Joi } from 'koa-context-validator';

export const getConfigValidator = validator({
    params: Joi.object().keys({
        key: Joi.string().required()
            .min(3, 'utf-8').max(20, 'utf-8'),
    })
})
export const updateConfigValidator = validator({
    params: Joi.object().keys({
        key: Joi.string().required()
            .min(3, 'utf-8').max(20, 'utf-8'),
    }),
    body: Joi.object().keys({
        value: Joi.required()
    })
})
