const express = require('express')
const router = express.Router()
const querystring = require('querystring')

const credentials = {
    'client_id': 'OYx2To5RLFjlbPhmHtQMPA',
    'client_secret': 'YvuG1OluMlyqaU7U6yYKQA',
    'client_service': 'VfLyBL6GXWyxNQQ7MtGMp9Q3CQ5/KNxd5TMCh+63wXo='
};

router.get('/', (req, res) => {
    res.render('pages/index')
    //res.send('index page')
})

router.get('/main', (req, res) => {
    const reqKeys = ['mall_id', 'user_id', 'user_name', 'user_type', 'shop_no', 'lang', 'nation', 'timestamp', 'hmac'];
    let query = req.query;

    console.log(query);

    if (!Object.keys(query).length) {
        res.send('error');
        return false;
    }

    let authdata = {};
    reqKeys.forEach(key => {        
        if (query.hasOwnProperty(key) === false) {
            res.send('Missing required value');
        }

        if (key != 'hmac') {
            authdata[key] = query[key];
        }
    });

    if (query.hasOwnProperty('is_multi_shop') === true) {
        authdata['is_multi_shop'] = query['is_multi_shop'];
    }

    if (['A', 'S'].includes(query.user_type) === true) {
        authdata['auth_config'] = query['auth_config'];
    }
    // sort
    authdata = Object.fromEntries(Object.entries(authdata).sort());

    const crypto = require('crypto');    
    const hmac = crypto.createHmac('sha256', credentials.client_secret);    
    const signed = hmac.update(Buffer.from(querystring.stringify(authdata), 'utf-8')).digest('base64');

    console.log('node hmac', signed);    
    console.log('querystring', query['hmac']);
})

module.exports = router