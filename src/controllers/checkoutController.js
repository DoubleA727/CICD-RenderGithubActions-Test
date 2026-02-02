const checkoutModel = require("../models/checkoutModel");

module.exports.getOrderItems = (req, res) => {
    const userId = req.body.user_id;
    if (!userId) {
        return res.status(500).json({ success: false, message: "Missing User Id" });
    }

    const data = {
        userId: userId
    }

    checkoutModel.gettingOrderItems(data, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }

        res.status(200).json({
            success: true,
            data: result
        });
    });
};

module.exports.getDataForReceipt = (req, res, next) => {
    const userId = req.body.user_id;
    const spinnerDiscount = req.body.spinnerDiscount;
    if (!userId) {
        return res.status(500).json({ success: false, message: "Missing User Id" });
    }

    const data = {
        userId: userId
    }

    checkoutModel.gettingDataForReceipt(data, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }

        res.data = result;
        res.discount = spinnerDiscount;
        next();
    });
};

module.exports.getCheckoutItems = (req, res) => {
    const userId = req.body.user_id;
    const qrcode = res.qrcode;
    console.log(qrcode);
    if (!userId) {
        return res.status(500).json({ success: false, message: "Missing User Id or unable to get order Data" });
    }

    const data = {
        userId: userId
    }

    checkoutModel.gettingCheckoutItems(data, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Server error" });
        }

        res.status(200).json({
            data: result,
            qr: qrcode
        });
    });
};