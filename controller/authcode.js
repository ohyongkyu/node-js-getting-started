const Joi = require('joi');
const axios = require('axios');
const querystring = require('querystring');
const { credentials, permissions } = require('../define/appInfo');
const libOAuth = require('../lib/libOAuth');
const Token = require('../models/token');

const schema = Joi.object().keys({
    code: Joi.string().alphanum().required(),
    state: Joi.string().required()
});

const authcodeController = async (req, res, next) => {
    let params = req.query;    
    const validateResult = Joi.validate(params, schema);

    if (validateResult.error != null) {
        console.error(validateResult.error);
        res.send('Missing required value');
        return;
    }
    const state = querystring.parse(Buffer.from(params['state'], 'base64').toString('utf-8'));
    params = Object.assign(params, state);    

    const response = await libOAuth.requestAccessToken(params['mall_id'], params['code']);

    console.log(response);

    const result = await new Token(response.data).save();

    console.log(result);

    res.send(querystring.stringify(response.data));
};

module.exports = authcodeController;