module.exports = `
    CREATE OR REPLACE FUNCTION add_custom_to_cart_return_item(
    p_user_id INT,
    p_merch_id INT,
    p_quantity INT,
    p_price_override NUMERIC DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    order_id INT,
    cart_quantity INT,
    order_item_id INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_price NUMERIC;
    v_stock INT;
    v_order_id INT;
    v_order_item_id INT;
    v_shipping_price NUMERIC := 5.00;
    v_total NUMERIC := 0;
    v_total_in_cart_for_merch INT := 0;
BEGIN
    ------------------------------------------------------------
    -- 1. Validate merch exists
    ------------------------------------------------------------
    PERFORM 1 FROM "Merch" WHERE "merchId" = p_merch_id;
    IF NOT FOUND THEN
        RETURN QUERY SELECT
            FALSE,
            'Invalid merch item.'::TEXT,
            NULL::INT,
            NULL::INT,
            NULL::INT;
        RETURN;
    END IF;

    ------------------------------------------------------------
    -- 2. Get stock
    ------------------------------------------------------------
    SELECT "quantity"
    INTO v_stock
    FROM "Stock"
    WHERE "merchId" = p_merch_id;

    IF v_stock IS NULL THEN
        RETURN QUERY SELECT FALSE, 'Stock record not found.'::TEXT, NULL::INT, NULL::INT, NULL::INT;
        RETURN;
    END IF;

    ------------------------------------------------------------
    -- 3. Find/create pending order
    ------------------------------------------------------------
    SELECT "id"
    INTO v_order_id
    FROM "Order"
    WHERE "userId" = p_user_id
      AND status = 'pending'
    ORDER BY "createdAt" DESC
    LIMIT 1;

    IF v_order_id IS NULL THEN
        INSERT INTO "Order" ("userId", status, "totalPrice", "shippingPrice", "createdAt")
        VALUES (p_user_id, 'pending', 0, v_shipping_price, NOW())
        RETURNING "id" INTO v_order_id;
    END IF;

    ------------------------------------------------------------
    -- 4. Get price (+ override)
    ------------------------------------------------------------
    IF p_price_override IS NOT NULL AND p_price_override > 0 THEN
        v_price := ROUND(p_price_override, 2);
    ELSE
        SELECT price INTO v_price
        FROM "Merch"
        WHERE "merchId" = p_merch_id;
    END IF;

    ------------------------------------------------------------
    -- 5. Stock check (sum ALL quantities of this merch in cart)
    --    because we allow multiple separate items
    ------------------------------------------------------------
    SELECT COALESCE(SUM(quantity), 0)
    INTO v_total_in_cart_for_merch
    FROM "OrderItem"
    WHERE "orderId" = v_order_id
      AND "merchId" = p_merch_id;

    IF (v_total_in_cart_for_merch + p_quantity) > v_stock THEN
        RETURN QUERY SELECT
            FALSE,
            ('Not enough stock. You already have ' || v_total_in_cart_for_merch ||
             ' in cart. Stock available: ' || v_stock)::TEXT,
            v_order_id::INT,
            v_total_in_cart_for_merch::INT,
            NULL::INT;
        RETURN;
    END IF;

    ------------------------------------------------------------
    -- 6. ALWAYS insert a new OrderItem (no merging)
    ------------------------------------------------------------
    INSERT INTO "OrderItem" ("orderId", "merchId", quantity, "subtotal")
    VALUES (v_order_id, p_merch_id, p_quantity, v_price * p_quantity)
    RETURNING id INTO v_order_item_id;

    ------------------------------------------------------------
    -- 7. Recalculate order total
    ------------------------------------------------------------
    SELECT COALESCE(SUM("subtotal"), 0)
    INTO v_total
    FROM "OrderItem"
    WHERE "orderId" = v_order_id;

    UPDATE "Order"
    SET "totalPrice" = v_total + v_shipping_price
    WHERE "id" = v_order_id;

    ------------------------------------------------------------
    -- Success return
    ------------------------------------------------------------
    RETURN QUERY SELECT
        TRUE,
        'Custom item added to cart.',
        v_order_id,
        (v_total_in_cart_for_merch + p_quantity),
        v_order_item_id;

END;
$$;



`
