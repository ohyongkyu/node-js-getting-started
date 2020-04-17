const webhookController = async(req, res, next) => {
    console.log(req.body);
    res.status(200).json({
        result: true
    });
    res.end();
};

module.exports = webhookController;
