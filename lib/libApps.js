const querystring = require('querystring');
const https = require('https');
const db = require('../db');
const modelMall = require('../models/mall');

class LibApps {
    constructor(query) {
        this.query = query;
        this.credentials = {
            'client_id': 'OYx2To5RLFjlbPhmHtQMPA',
            'client_secret': 'YvuG1OluMlyqaU7U6yYKQA',
            'client_service': 'VfLyBL6GXWyxNQQ7MtGMp9Q3CQ5/KNxd5TMCh+63wXo='
        };
        this.permissions = [
            'mall.read_application',
            'mall.write_application'
        ];                
    }

    isValidHmac() {
        const credentials = this.credentials;
        const reqKeys = ['mall_id', 'user_id', 'user_name', 'user_type', 'shop_no', 'lang', 'nation', 'timestamp', 'hmac'];        
        let query = this.query;        

        if (!Object.keys(query).length) {            
            console.log('Missing required value');
            return false;
        }
    
        let authdata = {};
        for (let key in reqKeys) {            
            let param = reqKeys[key];
            if (query.hasOwnProperty(param) === false) {
                console.log(`Missing required value (${param})`);
                return false;
                break;
            }

            if (param != 'hmac') {
                authdata[param] = query[param];
            }
        }        
    
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

        return (query['hmac'] === signed);
    }

    getReqData() {
        const reqData = {
            response_type: 'code',
            client_id: this.credentials['client_id'],
            redirect_uri: 'https://sweetnight.herokuapp.com/authcode',
            scope: this.permissions.join(',')
        };
        return reqData;
    }

    isInstalled(mallId) {
        const mallInfo = modelMall.findOne({mall_id:mallId}).exec();

        if (mallInfo == null || !Object.keys(mallInfo).length) {
            return false;
        }

        return mallInfo.status === 'using';
    }

    requestAccessToken() {
        const reqKeys = ['code', 'state'];
        let query = this.query;        

        if (!Object.keys(query).length) {            
            console.log('Missing required value');
            return false;
        }
        query = Object.assign(query, this.decodeStateData(query['state']));

        const url = `https://${query['mall_id']}.cafe24api.com/api/v2/oauth/token`;
        const clientId = this.credentials['client_id'];
        const clientSecret = this.credentials['client_secret']; 

        const options = {
            hostname: query['mall_id'] + '.cafe24api.com',
            port: 443,
            path: '/api/v2/oauth/token',
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret, 'utf-8').toString('base64'),
                'Content-type': 'application/x-www-form-urlencoded'
            }
        };

        console.log(options);

        const reqData = JSON.stringify({
            grant_type: 'authorization_code',
            code: query['code'],
            redirect_uri: 'https://sweetnight.herokuapp.com/authcode'                
        });

        console.log(reqData);

        const req = https.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`)
            console.log(res);
            
            res.on('data', d => {
                console.log(d);
                process.stdout.write(d)
            })
        });
            
        req.on('error', error => {
            console.error(error)
        });
            
        req.write(reqData);
        req.end();
    }

    encodeStateData(stateData) {
        return Buffer.from(querystring.stringify(stateData), 'utf-8').toString('base64');
    }

    decodeStateData(stateData) {
        return querystring.parse(Buffer.from(stateData, 'base64').toString('utf-8'));
    }
}

module.exports = LibApps;