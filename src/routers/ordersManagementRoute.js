const express = require('express');
const router = express.Router();

const ordersManagementController = require('../controllers/ordersManagementController');

router.get('/', ordersManagementController.getAllOrders);

module.exports = router;


