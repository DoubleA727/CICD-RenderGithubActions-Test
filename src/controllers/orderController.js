const orderModel = require("../models/orderModel");

// Update order item by ID (quantity)
module.exports.updateOrderById = (req, res) => {
  const orderItemId = parseInt(
    req.params.order_item_id ??
    req.params.orderItemId ??
    req.params.order_id ??
    req.params.orderId,
    10
  );

  const quantity = req.body.quantity ?? req.body.qty;

  if (!orderItemId || Number.isNaN(orderItemId)) {
    return res.status(400).json({ message: "Missing order_item_id." });
  }

  if (quantity === undefined) {
    return res.status(400).json({ message: "Missing quantity." });
  }

  const q = Number(quantity);
  if (!Number.isInteger(q) || q < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1." });
  }

  const data = {
    orderItemId,
    quantity: q
  };

  orderModel.updateById(data, (error, results) => {
    if (error) {
      console.error("updateOrderById error:", error);

      // Custom PL/pgSQL exception (insufficient stock, invalid order, etc.)
      if (error.message) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({ message: "Database error", error });
    }

    return res.status(200).json({
      message: "Order item updated successfully"
    });
  });

};


// Post Order (needs to be modified - edit shipping_price in database) (Lucas)
// controllers/orderController.js

module.exports.postOrder = (req, res) => {
  const userId = req.body.userId;
  const merchId = parseInt(req.body.merchId);
  const quantity = parseInt(req.body.quantity, 10);
  const priceOverride = req.body.priceOverride;
  const customization = req.body.customization; // <-- NEW (optional)

  if (!userId || !merchId || !quantity) {
    return res.status(400).json({ message: "Missing merchId or quantity." });
  }

  const data = {
    userId,
    merchId,
    quantity,
    priceOverride: priceOverride ? Number(priceOverride) : null,
    customization: customization || null
  };

  console.log("POST ORDER DATA:", data);

  // ✅ Backward compatible: if no customization, use existing model
  if (!data.customization) {
    return orderModel.postingOrder(data, (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Database error", error });
      }
      return res.status(200).json({
        success: results.rows[0].success,
        message: results.rows[0].message
      });
    });
  }

  // ✅ New path: customization exists
  orderModel.postingCustomOrder(data, (error, resultRow) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database error", error });
    }
    return res.status(200).json({
      success: resultRow.success,
      message: resultRow.message
    });
  });
};



// Get order by ID (only getting pending orders) (Lucas)
module.exports.getOrder = (req, res) => {
  // read from body string
  const userId = parseInt(req.body.userId, 10);

  if (!userId) {
    return res.status(400).json({ message: "Missing or invalid userId." });
  }

  const data = { userId };

  orderModel.gettingOrder(data, (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Database error", error });
    }

    // results is the pg result object: { rows, rowCount, ... }
    return res.status(200).json({
      message: "Retrieved Order",
      result: results,
    });
  });
};

// Delete order item by ID
module.exports.deleteOrderById = (req, res) => {
  const orderItemId = parseInt(
    req.params.order_item_id ??
    req.params.orderItemId ??
    req.params.order_id ??
    req.params.orderId,
    10
  );

  if (!orderItemId || Number.isNaN(orderItemId)) {
    return res.status(400).json({ message: "Missing order_item_id." });
  }

  const data = { orderItemId };

  orderModel.deleteById(data, (error, results) => {
    if (error) {
      console.error("deleteOrderById error:", error);

      if (error.message) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(500).json({ message: "Database error", error });
    }

    return res.status(200).json({
      message: "Order item deleted successfully"
    });
  });

};

