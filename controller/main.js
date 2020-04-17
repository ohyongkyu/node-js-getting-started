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
    const params = req.query;
    const mallId = params['mall_id'];

    if (process.env.NODE_ENV === 'production') {
        const validateResult = Joi.validate(params, schema);

        if (validateResult.error != null) {
            res.send('Missing required value');
            return;
        }
        if (isValidHmac() === false) {
            res.send('Invalid hmac');
            return;
        }
    }

    const mallInfo = await modelMall.findOne({mall_id: mallId}).exec();
    const currentUrl = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
    const stateData = {
        mall_id: mallId,
        redirect_url: currentUrl
    }    
    const reqData = querystring.stringify({
        response_type: 'code',
        client_id: credentials['client_id'],
        redirect_uri: 'https://sweetnight.herokuapp.com/authcode',
        scope: permissions.join(','),
        state: Buffer.from(querystring.stringify(stateData), 'utf-8').toString('base64')
    });
    const url = `https://${mallId}.cafe24api.com/api/v2/oauth/authorize?${reqData}`;

    if (mallInfo === null || mallInfo['status'] !== 'using') {
        res.redirect(url);
    }
    res.send('ㅁㅁㅁ');
};

module.exports = mainController;