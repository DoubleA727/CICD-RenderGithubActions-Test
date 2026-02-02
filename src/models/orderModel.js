const pool = require("../services/db");

// 1) POST /api/cart
module.exports.postingOrder = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM add_to_cart($1, $2, $3, $4);
  `;

  const VALUES = [
    data.userId,
    data.merchId,             // MUST be an array
    data.quantity,            // MUST be an array
    data.priceOverride       // MUST be an array
  ];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// 2) GET /api/cart
module.exports.gettingOrder = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM get_orders(?);
  `;

  //null values making sure odnt overwrite blacnks
  const VALUES = [data.userId];

  // console.log(VALUES);

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// 3) PUT /api/order/:order_id  -> update one order item
module.exports.updateById = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT update_order_item($1, $2);
  `;
  const VALUES = [data.orderItemId, data.quantity];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

// 4) DELETE /api/order/:order_id -> delete one order item
module.exports.deleteById = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT delete_order_item($1);
  `;
  const VALUES = [data.orderItemId];

  pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.postingCustomOrder = (data, callback) => {
  // 1) Call function that returns order_item_id
  pool.query(
    `SELECT * FROM add_custom_to_cart_return_item($1, $2, $3, $4);`,
    [data.userId, data.merchId, data.quantity, data.priceOverride],
    (err, cartRes) => {
      if (err) return callback(err);

      const row = cartRes?.rows?.[0];
      if (!row) return callback(new Error("add_custom_to_cart_return_item returned no rows"));

      // If add_to_cart failed, return directly
      if (!row.success) return callback(null, row);

      if (!row.order_item_id) return callback(new Error("No order_item_id returned"));

      const c = data.customization || {};

      // 2) Insert customization row
      pool.query(
        `
        INSERT INTO "OrderItemCustomizations"
          ("orderItemId", "color", "customText", "badgeKey", "previewUrl", "previewData")
        VALUES
          ($1, $2, $3, $4, $5, $6)
        ON CONFLICT ("orderItemId") DO UPDATE
        SET "color" = EXCLUDED."color",
            "customText" = EXCLUDED."customText",
            "badgeKey" = EXCLUDED."badgeKey",
            "previewUrl" = EXCLUDED."previewUrl",
            "previewData" = EXCLUDED."previewData";
        `,
        [
          row.order_item_id,
          c.color || "black",
          c.customText ?? null,
          c.badgeKey ?? null,
          c.previewUrl ?? null,
          c.previewData ?? null,
        ],
        (err2) => {
          if (err2) return callback(err2);
          return callback(null, row);
        }
      );
    }
  );
};




