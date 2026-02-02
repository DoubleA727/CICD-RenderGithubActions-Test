module.exports = `
-- DELETE ORDER ITEM
CREATE OR REPLACE FUNCTION delete_order_item(
    p_order_item_id INT
)
RETURNS VOID AS
$$
DECLARE
    v_order_id  INT;
    v_merch_id  INT;
    v_quantity  INT;
    v_subtotal  DOUBLE PRECISION;
    v_status    TEXT;
BEGIN
    SELECT oi."orderId", oi."merchId", oi."quantity", oi."subtotal"
    INTO   v_order_id, v_merch_id, v_quantity, v_subtotal
    FROM   "OrderItem" oi
    WHERE  oi."id" = p_order_item_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order item % not found', p_order_item_id;
    END IF;

    SELECT o."status"
    INTO   v_status
    FROM   "Order" o
    WHERE  o."id" = v_order_id;

    IF v_status IN ('completed', 'complete', 'cancelled') THEN
        RAISE EXCEPTION 'Cannot delete items from % order', v_status;
    END IF;

    -- Return quantity to stock
    UPDATE "Stock"
    SET "quantity" = "quantity" + v_quantity
    WHERE "merchId" = v_merch_id;

    -- Reduce order total
    UPDATE "Order"
    SET "totalPrice" = "totalPrice" - v_subtotal
    WHERE "id" = v_order_id;

    -- Delete the order item
    DELETE FROM "OrderItem"
    WHERE "id" = p_order_item_id;
END;
$$ LANGUAGE plpgsql;
`