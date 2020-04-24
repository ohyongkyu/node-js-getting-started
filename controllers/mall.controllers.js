const Joi = require('joi');
const querystring = require('querystring');
const validateSchema = require('../define/validateSchema');
const Mall = require('../models/mall.models');
const Token = require('../models/token.models');
const libApi = require('../lib/libApi');
const libOAuth = require('../lib/libOAuth');
const { credentials, permissions } = require('../define/appInfo');

const MallController = {
    isValidHmac: async (req, res, next) => {
        try {
            const params = req.query;
            console.log(params);

            if (process.env.NODE_ENV == 'development') {
                return next();                
            }
            const validateResult = await Joi.validate(params, validateSchema.main);        
    
            // Spread
            let authdata = { ...params };
            delete authdata['hmac'];
        
            if (params.hasOwnProperty('is_multi_shop') === true) {
                authdata['is_multi_shop'] = params['is_multi_shop'];
            }
        
            if (['A', 'S'].includes(params['user_type']) === true) {
                authdata['auth_config'] = params['auth_config'];
            }
            // sort
            authdata = Object.fromEntries(Object.entries(authdata).sort());
        
            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', credentials['client_secret']);    
            const signed = hmac.update(Buffer.from(querystring.stringify(authdata), 'utf-8')).digest('base64');
            
            if (params['hmac'] !== signed) {
                console.log(params);
                console.log(params['hmac']);
                console.log(signed);
                res.send('Invalid hmac');
                return;
            }
            next();
        } catch (error) {            
            res.send('Invalid hmac');
            return false;
        }
    },

    isInstalled: async (mallId) => {
        try {
            const mallInfo = await Mall.findOne({mall_id: mallId}).exec();

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

            if (accessToken === null) {
                return false;
            }

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
        const isInstalled = await MallController.isInstalled(mallId);
        const isValidAccessToken = await MallController.isValidAccessToken(mallId);

        if (isInstalled === false || isValidAccessToken === false) {
            const currentUrl = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
            const reqData = querystring.stringify({
                response_type: 'code',
                client_id: credentials['client_id'],
                redirect_uri: 'https://sweetnight.herokuapp.com/authcode',
                scope: permissions.join(','),
                state: Buffer.from(querystring.stringify(params), 'utf-8').toString('base64')
            });
            const url = `https://${mallId}.cafe24api.com/api/v2/oauth/authorize?${reqData}`;

            res.redirect(url);
            return;
        }

        
        const accessToken = await MallController.getAccessToken(mallId);        
        await libApi.setScriptTags(mallId, accessToken, {
            request: {
                src: 'https://evergreen33.cafe24.com/store/product.js',
                display_location: [
                    'PRODUCT_DETAIL',
                    'PRODUCT_LIST'
                ]
            }
        });

        await libApi.setScriptTags(mallId, accessToken, {
            request: {
                src: 'https://evergreen33.cafe24.com/store/board.js',
                display_location: [
                    'BOARD_MAIN',
                    'BOARD_FREE_LIST',
                    'BOARD_FREE_DETAIL'
                ]
            }
        });        
        res.render('pages/main', params);
    },

    authcode: async(req, res, next) => {
        try {
            let params = req.query;

            if (params.hasOwnProperty('error') === true) {
                res.send(params.error);
                return;
            }
    
            const validateResult = await Joi.validate(params, validateSchema.authcode);

            const state = querystring.parse(Buffer.from(params['state'], 'base64').toString('utf-8'));
            params = Object.assign(params, state);
    
            const response = await libOAuth.requestAccessToken(params['mall_id'], params['code']);
            const filter = {mall_id: params['mall_id']};
            const accessToken = response.data;
            
            const isInstalled = await MallController.isInstalled(params['mall_id']);
            if (isInstalled === false) {
                await new Mall({
                    mall_id: params['mall_id'],
                    country_code: params['nation'],
                    status: 'using'
                }).save();
            } else {
                // App 정보 갱신
                await Mall.updateOne({
                    mall_id: params['mall_id']
                }, {
                    country_code: params['nation'], 
                    status: 'using', 
                    updated_at: Date.now()
                });
            }
            // 토큰 갱신
            await Token.findOneAndUpdate(
                filter,
                accessToken,
                {new: true, upsert: true}
            );
    
            res.render('pages/main', params);
        } catch (error) {
            console.error(error);
            res.send(error);
            return;
        }
    },

    webhook: async (req, res, next) => {
        const payload = req.body;
        const validateResult = await Joi.validate(payload, validateSchema.webhook);

        if (validateResult.error != null) {
            console.error(validateResult.error);
            res.send('Missing required value');
            return;
        }

        try {
            const filter = {mall_id: payload['resource']['mall_id']};
            await Mall.deleteOne(filter);
            await Token.deleteOne(filter);
            res.status(200);
        } catch (error) {            
            res.status(500);
        }
        res.end();
    },

    getAccessToken: async (mallId) => {
        try {
            let accessToken = await Token.findOne({mall_id: mallId}).exec();

            if (accessToken == null) {                
                return null;
            }

            const currentDate = new Date();           
            if (currentDate < accessToken['expires_at']) {
                return accessToken['access_token'];
            }
            const response = await libOAuth.refreshAccessToken(mallId, accessToken['refresh_token']);
            const validateResult = await Joi.validate(response.data, validateSchema.accessToken);

            accessToken = response.data;

            // 토큰 갱신
            await Token.findOneAndUpdate(
                {mall_id: mallId},
                accessToken,
                {new: true, upsert: true}
            );
            return accessToken['access_token'];
        } catch (error) {
            console.error(error);
            return null;
        }
    }    
}

module.exports = MallController;