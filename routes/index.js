const express = require('express');
const router = express.Router();
const LibApps = require('../lib/libApps');

router.get('/', (req, res) => {
    res.render('pages/index')
});

router.get('/main', (req, res, next) => {
    const querystring = require('querystring');
    const params = req.query;
    const libApps = new LibApps(params);    

    if (process.env.NODE_ENV === 'production') {
        // hmac 검증
        if (libApps.isValidHmac() === false) {
            res.send('Invalid Hmac');
            return false;
        }
    }

    const currentUrl = `${req.protocol}://${req.headers.host}${req.originalUrl}`;    
    const reqData = libApps.getReqData();
    const stateData = {
        mall_id: params['mall_id'],
        redirect_url: currentUrl
    };
    reqData['state'] = libApps.encodeStateData(stateData);
    
    const redirectUrl = `https://${params['mall_id']}.cafe24api.com/api/v2/oauth/authorize?${querystring.stringify(reqData)}`;
    
    if (libApps.isInstalled(params['mall_id']) === false) {        
        res.redirect(redirectUrl);
    }    
    res.send('app admin');
});

router.get('/authcode', (req, res, next) => {
    const params = req.query;
    const libApps = new LibApps(params);
    
    libApps.requestAccessToken();
    res.send('authcode');
});

module.exports = router;