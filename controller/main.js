const Joi = require('joi');
const modelMall = require('../models/mall');
const querystring = require('querystring');
const { credentials, permissions } = require('../define/appInfo');

const schema = Joi.object().keys({
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
});

const isValidHmac = () => {
};

const mainController = async (req, res, next) => {

};

module.exports = mainController;