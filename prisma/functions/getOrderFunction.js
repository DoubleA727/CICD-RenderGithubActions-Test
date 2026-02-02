module.exports = `
CREATE OR REPLACE FUNCTION get_orders(
    p_userId INT
)
RETURNS TABLE (
    orderItemId INT,          -- 🔴 NEW
    orderId     INT,
    userId      INT,
    merchId     INT,
    name        TEXT,
    status      TEXT,
    quantity    INT,
    subtotal    DOUBLE PRECISION
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        oi."id"       AS "orderItemId",   -- 🔴 OrderItem PK
        oi."orderId"  AS "orderId",       -- same as before
        o."userId"    AS "userId",
        oi."merchId"  AS "merchId",
        m."name"      AS "name",
        o."status"    AS "status",
        oi."quantity" AS "quantity",
        oi."subtotal" AS "subtotal"
    FROM "Order" o
    JOIN "OrderItem" oi ON oi."orderId" = o."id"
    JOIN "Merch" m      ON oi."merchId" = m."merchId"
    WHERE o."userId" = p_userId
      AND o."status" = 'pending';
END;
$$ LANGUAGE plpgsql;
`;
