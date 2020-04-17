const axios = require('axios');
const querystring = require('querystring');
const { credentials } = require('../define/appInfo');

const libOAuth = {
    getUrl: (mallId) => {
        return `https://${mallId}.cafe24api.com/api/v2/oauth/token`;
    },

    getHeaders: () => {
        const clientId = credentials['client_id'];
        const clientSecret = credentials['client_secret']; 
        const headers = {
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret, 'utf-8').toString('base64'),
            'Content-type': 'application/x-www-form-urlencoded'            
        };
        return headers;
    },

    requestAccessToken: async (mallId, authorizationCode) => {
        const url = this.getUrl(mallId);
        const headers = this.getHeaders();
        const reqData = querystring.stringify({
            'grant_type': 'authorization_code',
            'code': authorizationCode,
            'redirect_uri': 'https://sweetnight.herokuapp.com/authcode'
        });
        return await axios.post(url, reqData, {'headers': headers});
    },

    refreshAccessToken: async (mallId, refreshToken) => {
        const url = this.getUrl(mallId);
        const headers = this.getHeaders();
        const reqData = querystring.stringify({
            'grant_type': 'refresh_token',
            'refresh_token': refreshToken
        });
        return await axios.post(url, reqData, {'headers': headers});
    }
};
    
module.exports = libOAuth;