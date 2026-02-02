const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const bcryptMiddleware = require('../middlewares/bcryptMiddleware')

// 1) POST /cart
router.post('/postOrder', orderController.postOrder);

// 2) GET /cart
router.post('/', orderController.getOrder);

// 3) PUT /cart
router.put('/:order_id', orderController.updateOrderById);

// 4) DELETE /cart
router.delete('/:order_id', orderController.deleteOrderById);

module.exports = router;