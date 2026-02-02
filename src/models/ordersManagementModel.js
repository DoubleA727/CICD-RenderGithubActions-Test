const pool = require('../services/db')

// GET /orders
module.exports.retrieveAllOrders = (callback) => {
  const SQL = `
    SELECT
      o.id                    AS "orderId",
      o.status                AS "status",
      o."createdAt"           AS "createdAt",
      o."shippingPrice"       AS "shippingPrice",
      o."totalPrice"          AS "totalPrice",

      u."userId"              AS "userId",
      u."username"            AS "username",

      COALESCE(
        json_agg(
          json_build_object(
            'orderItemId', oi.id,
            'merchId',     oi."merchId",
            'name',        m.name,
            'price',       m.price,
            'quantity',    oi.quantity,
            'subtotal',    oi.subtotal,
            'imageUrl',    m."imageUrl"
          )
          ORDER BY oi.id
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'::json
      ) AS "items"

    FROM "Order" o
    JOIN "Users" u
      ON u."userId" = o."userId"
    LEFT JOIN "OrderItem" oi
      ON oi."orderId" = o.id
    LEFT JOIN "Merch" m
      ON m."merchId" = oi."merchId"

    GROUP BY o.id, u."userId", u."username"
    ORDER BY o."createdAt" DESC;
  `;
  
  pool.query(SQL, callback);
};
