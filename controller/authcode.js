const Joi = require('joi');
const axios = require('axios');
const querystring = require('querystring');
const { credentials, permissions } = require('../define/appInfo');
const libOAuth = require('../lib/libOAuth');

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

 /*
data: {
    access_token: 'YNHaGGoIEN1soZYgiQxUoB',
    expires_at: '2020-04-18T01:27:09.000',
    refresh_token: 'jxGVDFvLPRNrUNU8u8H1mC',
    refresh_token_expires_at: '2020-05-01T23:27:09.000',
    client_id: 'OYx2To5RLFjlbPhmHtQMPA',
    mall_id: 'corona19',
    user_id: 'corona19',
    scopes: [ 'mall.read_application', 'mall.write_application' ],
    issued_at: '2020-04-17T23:27:09.000'
}
*/

    res.send(querystring.stringify(response.data));
};

module.exports = authcodeController;