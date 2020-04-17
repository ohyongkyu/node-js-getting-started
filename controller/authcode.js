const Joi = require('joi');
const axios = require('axios');
const querystring = require('querystring');
const { credentials, permissions } = require('../define/appInfo');
const libOAuth = require('../lib/libOAuth');

const schema = Joi.object().keys({
    code: Joi.string().alphanum().required(),
    state: Joi.string().alphanum().required()
});

const authcodeController = (req, res, next) => {
    let params = req.query;    
    const validateResult = Joi.validate(params, schema);

    if (validateResult.error != null) {
        res.send('Missing required value');
        return;
    }
    const state = querystring.parse(Buffer.from(params['state'], 'base64').toString('utf-8'));
    params = Object.assign(params, state);    

    const result = libOAuth.refreshAccessToken(params['mall_id'], params['code']);
    console.log(result);

    res.send('test');
};

module.exports = authcodeController;