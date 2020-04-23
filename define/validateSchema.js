const Joi = require('joi');

const validateSchema = {
    main: {
        mall_id: Joi.string().alphanum().min(4).max(16).required(),
        user_id: Joi.string().alphanum().min(4).max(20).required(),
        user_name: Joi.string().min(4).max(20).required(),
        user_type: Joi.string().valid("A", "S", "P").required(),
        shop_no: Joi.number().required(),
        lang: Joi.string().regex(/^[a-z]{2}_[A-Z]{2}$/).required(),
        nation: Joi.string().regex(/^[A-Z]{2}$/).required(),
        timestamp: Joi.number().required(),
        hmac: Joi.string().required(),
        is_multi_shop: Joi.string().optional(),
        auth_config: Joi.string().optional()
    },

    authcode: {
        code: Joi.string().alphanum().required(),
        state: Joi.string().required()        
    },

    webhook: {
        id: Joi.string().required(),
        resource_type: Joi.string().valid('APP').required(),
        event_type: Joi.string().valid("MALL.APP.DELETED", "MALL.APP.EXPIRED").required(),
        resource: Joi.object().keys({
            client_id: Joi.string().required(),
            mall_id: Joi.string().required(),
            event_datetime: Joi.date().optional()
        }),
        version: Joi.string().required(),
        issue_datetime: Joi.any().required()
    },

    accessToken: {
        access_token: Joi.string().alphanum().required(),
        expires_at: Joi.date().required(),
        refresh_token: Joi.string().alphanum().required(),
        refresh_token_expires_at: Joi.date().required(),
        client_id: Joi.string().alphanum().required(),
        mall_id: Joi.string().alphanum().min(4).max(16).required(),
        user_id: Joi.string().alphanum().min(4).max(20).required(),
        scopes: Joi.array().required(),
        issued_at: Joi.date().required()
    }
};

module.exports = validateSchema;