const express = require('express');
const router = express.Router();

const mallController = require('../controllers/mall.controllers');

router.get('/', (req, res) => {
    res.render('pages/index')
});

router.get('/main', mallController.isValidHmac, mallController.main);
router.get('/authcode', mallController.authcode);
router.post('/webhook', mallController.webhook);

module.exports = router;