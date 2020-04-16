const express = require('express')
const router = express.Router()
const LibApps = require('../lib/libApps')

router.get('/', (req, res) => {
    res.render('pages/index')
});

router.get('/main', (req, res, next) => {        
    const libApps = new LibApps(req.query);

    /*
    if (libApps.checkValidation() === false) {
        res.send('Invalid Hmac');
        return false;
    }
    */

    console.log(process.env.NODE_ENV);
    //const redirectUri = 'https://'


    res.send('app check');
});

router.get('/authcode', (req, res, next) => {

});

module.exports = router