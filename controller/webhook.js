const webhookController = async(req, res, next) => {
    console.log(req.body);
    res.status(200);
    res.end();
};

module.exports = webhookController;
