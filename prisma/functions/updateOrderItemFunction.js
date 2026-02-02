module.exports = `
-- UPDATE ORDER ITEM
CREATE OR REPLACE FUNCTION update_order_item(
    p_order_item_id INT,
    p_new_quantity  INT
)
RETURNS VOID AS
$$
DECLARE
    v_order_id      INT;
    v_merch_id      INT;
    v_old_quantity  INT;
    v_stock_qty     INT;
    v_status        TEXT;
    v_price         DOUBLE PRECISION;
    v_qty_diff      INT;
    v_subtotal_diff DOUBLE PRECISION;
BEGIN
    IF p_new_quantity IS NULL OR p_new_quantity < 1 THEN
        RAISE EXCEPTION 'Quantity must be at least 1';
    END IF;

    -- Get current order item info
    SELECT oi."orderId", oi."merchId", oi."quantity"
    INTO   v_order_id, v_merch_id, v_old_quantity
    FROM   "OrderItem" oi
    WHERE  oi."id" = p_order_item_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order item % not found', p_order_item_id;
    END IF;

    -- Check order status
    SELECT o."status"
    INTO   v_status
    FROM   "Order" o
    WHERE  o."id" = v_order_id;

    IF v_status IN ('completed', 'complete', 'cancelled') THEN
        RAISE EXCEPTION 'Cannot update items for % order', v_status;
    END IF;

    v_qty_diff := p_new_quantity - v_old_quantity;

    -- If increasing quantity, must check stock
    IF v_qty_diff > 0 THEN
        SELECT s."quantity"
        INTO   v_stock_qty
        FROM   "Stock" s
        WHERE  s."merchId" = v_merch_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'No stock row for merch %', v_merch_id;
        END IF;

        IF v_stock_qty < v_qty_diff THEN
            RAISE EXCEPTION 'Not enough stock for merch %. Extra requested: %, available: %',
                v_merch_id, v_qty_diff, v_stock_qty;
        END IF;

        UPDATE "Stock"
        SET "quantity" = "quantity" - v_qty_diff
        WHERE "merchId" = v_merch_id;

    ELSIF v_qty_diff < 0 THEN
        -- Decreasing quantity -> return difference to stock
        UPDATE "Stock"
        SET "quantity" = "quantity" + (v_old_quantity - p_new_quantity)
        WHERE "merchId" = v_merch_id;
    END IF;

    -- Get merch price
    SELECT m."price"
    INTO   v_price
    FROM   "Merch" m
    WHERE  m."merchId" = v_merch_id;

    IF v_price IS NULL THEN
        RAISE EXCEPTION 'Price not found for merch %', v_merch_id;
    END IF;

    v_subtotal_diff := v_qty_diff * v_price;

    -- Update order item
    UPDATE "OrderItem"
    SET "quantity" = p_new_quantity,
        "subtotal" = "subtotal" + v_subtotal_diff
    WHERE "id" = p_order_item_id;

    -- Update order total
    UPDATE "Order"
    SET "totalPrice" = "totalPrice" + v_subtotal_diff
    WHERE "id" = v_order_id;
END;
$$ LANGUAGE plpgsql;
`