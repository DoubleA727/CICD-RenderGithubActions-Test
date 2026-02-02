-- Drop procedure if it exists
DROP PROCEDURE IF EXISTS add_to_cart;

CREATE OR REPLACE PROCEDURE add_to_cart(
    p_user_id INT,
    p_merch_ids INT[],           -- array of merch IDs
    p_quantities INT[],          -- array of quantities
    p_price_overrides NUMERIC[]  -- array of discounted prices (NULL = no discount)
)
LANGUAGE plpgsql
AS $$
DECLARE
    i INT;
    v_price NUMERIC;
    v_subtotal NUMERIC;
    v_total NUMERIC := 0;
    v_order_id INT;
    v_shipping_price NUMERIC := 5.00;
    v_count INT;
    v_stock INT;
BEGIN
    -- 1. Validate arrays
    IF array_length(p_merch_ids, 1) != array_length(p_quantities, 1) THEN
        RAISE EXCEPTION 'merch_ids and quantities must have same length';
    END IF;

    IF p_price_overrides IS NOT NULL
       AND array_length(p_price_overrides, 1) != array_length(p_merch_ids, 1)
    THEN
        RAISE EXCEPTION 'price_overrides must match merch_ids length';
    END IF;

    -- 2. Validate merch exists + stock
    FOR i IN 1..array_length(p_merch_ids, 1) LOOP
        
        -- merch exists?
        SELECT COUNT(*) INTO v_count
        FROM "Merch"
        WHERE "merchId" = p_merch_ids[i];

        IF v_count = 0 THEN
            RAISE EXCEPTION 'Invalid merchId: %', p_merch_ids[i];
        END IF;

        -- check stock
        SELECT quantity INTO v_stock
        FROM "Stock"
        WHERE "merchId" = p_merch_ids[i];

        IF p_quantities[i] > v_stock THEN
            RAISE EXCEPTION 'Not enough stock for merchId %', p_merch_ids[i];
        END IF;
    END LOOP;

    -- 3. Find existing pending order
    SELECT "id"
    INTO v_order_id
    FROM "Order"
    WHERE "userId" = p_user_id
      AND status = 'pending'
    ORDER BY "createdAt" DESC
    LIMIT 1;

    -- 4. If none, create new order
    IF v_order_id IS NULL THEN
        INSERT INTO "Order" ("userId", status, "totalPrice", "shippingPrice", "createdAt")
        VALUES (p_user_id, 'pending', 0, v_shipping_price, NOW())
        RETURNING "id" INTO v_order_id;
    END IF;

    -- 5. Insert items
    FOR i IN 1..array_length(p_merch_ids, 1) LOOP

        -- determine price (override or normal)
        IF p_price_overrides IS NOT NULL
           AND p_price_overrides[i] IS NOT NULL
           AND p_price_overrides[i] > 0
        THEN
            v_price := p_price_overrides[i];
        ELSE
            SELECT price INTO v_price
            FROM "Merch"
            WHERE "merchId" = p_merch_ids[i];
        END IF;

        -- compute subtotal
        v_subtotal := v_price * p_quantities[i];
        v_total := v_total + v_subtotal;

        -- insert into OrderItem
        INSERT INTO "OrderItem" ("orderId", "merchId", quantity, "subtotal")
        VALUES (v_order_id, p_merch_ids[i], p_quantities[i], v_subtotal);

    END LOOP;

    -- 6. Update order total
    UPDATE "Order"
    SET "totalPrice" = v_total + v_shipping_price
    WHERE "id" = v_order_id;

END;
$$;
