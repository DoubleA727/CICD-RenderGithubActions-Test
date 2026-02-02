DROP FUNCTION IF EXISTS get_orders(integer);

CREATE OR REPLACE FUNCTION get_orders(
    p_userId INT
)
RETURNS TABLE (
    "orderId"   INT,
    "userId"    INT,
    "merchId"   INT,
    "merchName" TEXT,
    "status"    TEXT,
    "quantity"  INT,
    "price"     DOUBLE PRECISION
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        oi."orderId"     AS "orderId",
        o."userId"       AS "userId",
        m."merchId"      AS "merchId",
        m."name"         AS "merchName",
        o."status"       AS "status",
        oi."quantity"    AS "quantity",
        m."price"        AS "price"
    FROM "Order"     o
    JOIN "OrderItem" oi ON oi."orderId" = o."id"
    JOIN "Merch"     m  ON oi."merchId" = m."merchId"
    WHERE o."userId" = p_userId
      AND o."status" = 'pending';
END;
$$ LANGUAGE plpgsql;
