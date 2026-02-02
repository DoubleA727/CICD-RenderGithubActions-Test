const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkoutController");
const emailController = require("../controllers/emailController")

router.post("/", checkoutController.getOrderItems);
router.post("/postCheckout", checkoutController.getDataForReceipt, emailController.sendReceipt, checkoutController.getCheckoutItems);

module.exports = router;