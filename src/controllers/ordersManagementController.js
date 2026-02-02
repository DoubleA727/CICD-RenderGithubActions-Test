const ordersManagementModel = require('../models/ordersManagementModel');

// GET /orders
module.exports.getAllOrders = (req, res) => {
  ordersManagementModel.retrieveAllOrders((error, result) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(200).json(result.rows);
  });
};
