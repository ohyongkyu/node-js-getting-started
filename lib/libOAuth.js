const axios = require('axios');
const querystring = require('querystring');
const { credentials } = require('../define/appInfo');

const libOAuth = {
    getUrl: function(mallId) {
        return `https://${mallId}.cafe24api.com/api/v2/oauth/token`;
    },

    getHeaders: function() {
        const clientId = credentials['client_id'];
        const clientSecret = credentials['client_secret']; 
        const headers = {
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret, 'utf-8').toString('base64'),
            'Content-type': 'application/x-www-form-urlencoded'            
        };
        return headers;
    },

    requestAccessToken: async function(mallId, authorizationCode) {
        const url = this.getUrl(mallId);        
        const headers = this.getHeaders();
        const reqData = querystring.stringify({
            'grant_type': 'authorization_code',
            'code': authorizationCode,
            'redirect_uri': 'https://sweetnight.herokuapp.com/authcode'
        });

        try {
            return await axios.post(url, reqData, {'headers': headers});
        } catch (error) {
            console.error(error);
        }
    },
    refreshAccessToken: async function(mallId, refreshToken) {
        try {
            const url = this.getUrl(mallId);
            const headers = this.getHeaders();
            const reqData = querystring.stringify({
                'grant_type': 'refresh_token',
                'refresh_token': refreshToken
            });
            return await axios.post(url, reqData, {'headers': headers});
        } catch (error) {
            console.error(error);
            return null;            
        }        
    }
};
    
module.exports = libOAuth;