const webhookController = async(req, res, next) => {
    console.log(req.body);
    res.send('webhook');
};

module.exports = webhookController;
