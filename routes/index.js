const express = require('express')
const router = express.Router()
const LibApps = require('../lib/libApps')

router.get('/', (req, res) => {
    res.render('pages/index')
})

router.get('/main', (req, res) => {
    const libApps = new LibApps(req.query);

    if (libApps.isValidHmac() === false) {
        res.send('Invalid Hmac');
        return false;
    }
    res.send('app check');
})

module.exports = router