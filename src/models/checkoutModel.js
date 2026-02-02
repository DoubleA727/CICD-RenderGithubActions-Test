const pool = require("../services/db");

module.exports.gettingOrderItems = (data, callback) => {
  const SQL = `
    SELECT 
      m."name", 
      oi."quantity", 
      oi."subtotal"
    FROM "OrderItem" oi
    JOIN "Merch" m 
      ON oi."merchId" = m."merchId"
    JOIN "Order" o 
      ON o."id" = oi."orderId"
    WHERE o."userId" = $1
  `;

  pool.query(SQL, data.userId, (err, result) => {
    if (err) return callback(err);
    callback(null, result.rows);
  });
};

module.exports.gettingDataForReceipt = (data, callback) => {
  const SQL = `
    SELECT o."id", u."email", m."name", o."totalPrice", oi."quantity", oi."subtotal"
    FROM "Users" u 
    JOIN "Order" o 
    ON u."userId"=o."userId" 
    JOIN "OrderItem" oi 
    ON o."id"=oi."orderId" 
    JOIN "Merch" m 
    ON oi."merchId"=m."merchId" 
    WHERE u."userId" = $1
  `;

  // return multiple rows of data
  pool.query(SQL, [data.userId], (err, result) => {
    if (err) return callback(err);
    callback(null, result.rows);
  });
};

module.exports.gettingCheckoutItems = (data, callback) => {
  const SQL = `call checkout_order($1);`;

  pool.query(SQL, data.userId, (err, result) => {
    if (err) return callback(err);
    callback(null, result.rows);
  });
};
