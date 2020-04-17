const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin');
const mainController = require('../controller/main');
const authcodeController = require('../controller/authcode');
const webhookController = require('../controller/webhook');

router.get('/', (req, res) => {
    res.render('pages/index')
});

router.get('/admin', adminController);
router.get('/main', mainController);
router.get('/authcode', authcodeController);
router.post('/webhook', webhookController);

module.exports = router;