const querystring = require('querystring');
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
}

module.exports = LibApps;