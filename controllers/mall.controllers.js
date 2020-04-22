const Joi = require('joi');
const querystring = require('querystring');
const validateSchema = require('../define/validateSchema');
const Mall = require('../models/mall.models');
const Token = require('../models/token.models');
const { credentials, permissions } = require('../define/appInfo');

const MallController = {
    isValidHmac: (params) => {        
        let authdata = params;        
        delete authdata['hmac'];
    
        if (query.hasOwnProperty('is_multi_shop') === true) {
            authdata['is_multi_shop'] = query['is_multi_shop'];
        }
    
        if (['A', 'S'].includes(query.user_type) === true) {
            authdata['auth_config'] = query['auth_config'];
        }
        // sort
        authdata = Object.fromEntries(Object.entries(authdata).sort());
    
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', credentials['client_secret']);    
        const signed = hmac.update(Buffer.from(querystring.stringify(authdata), 'utf-8')).digest('base64');
    
        return (params['hmac'] === signed);
    },

    isInstalled: async (mallId) => {
        try {
            const mallInfo = await Mall.findOne({mall_id: mallId, status: 'using'}).exec();

            if (mallInfo === null) {
                return false;
            }
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    isValidAccessToken: async (mallId) => {
        try {
            const accessToken = await Token.findOne({mall_id: mallId}).exec();

            const currentDate = new Date();
            if (currentDate > accessToken['refresh_token_expires_at']) {
                return false;
            }

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    main: async (req, res, next) => {
        const params = req.query;
        const mallId = params['mall_id'];
        const countryCode = params['nation'];
    
        if (process.env.NODE_ENV === 'production') {
            const validateResult = Joi.validate(params, validateSchema.main);
    
            if (validateResult.error != null) {
                res.send('Missing required value');
                return;
            }
            if (MallController.isValidHmac(params) === false) {
                res.send('Invalid hmac');
                return;
            }
        }

        if (MallController.isInstalled(mallId) === false || MallController.isValidAccessToken(mallId) === false) {            
            const currentUrl = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
            const stateData = {
                mall_id: mallId,
                country_code: countryCode,
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

            res.redirect(url);
        }        

        res.send('ㅁㅁㅁ');    
    },

    authcode: async(req, res, next) => {
        let params = req.query;

        if (params.hasOwnProperty('error') === true) {
            res.send(params.error);
            return false;
        }

        const validateResult = Joi.validate(params, validateSchema.authcode);
    
        if (validateResult.error != null) {
            console.error(validateResult.error);
            res.send('Missing required value');
            return;
        }
        const state = querystring.parse(Buffer.from(params['state'], 'base64').toString('utf-8'));
        params = Object.assign(params, state);

        let doc = await Mall.findOneAndUpdate(
            {
                mall_id: params['mall_id']
            },
            {
                country_code: params['country_code'],
                status: 'using'
            }, {
                new: true,
                upsert: true
            }
        );
        console.log(doc);

        const response = await libOAuth.requestAccessToken(params['mall_id'], params['code']);
    
        //console.log(response);
    
        //const result = await new Token(response.data).save();
    
        //console.log(result);
    
        res.send(querystring.stringify(response.data));
    },

    admin: (req, res, next) => {

    },

    webhook: (req, res, next) => {

    }
}

module.exports = MallController;