module.exports = `

CREATE OR REPLACE PROCEDURE checkout_order(
    p_user_id INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_tier INT;
    v_order_id INT;
    v_stock INT;
    v_upgrade BOOLEAN := FALSE;

    rec RECORD;
BEGIN
    ------------------------------------------------------------
    -- 0. Get user tier
    ------------------------------------------------------------
    SELECT "tierId"
    INTO v_user_tier
    FROM "UserTier"
    WHERE "userId" = p_user_id;

    IF v_user_tier IS NULL THEN
        v_user_tier := 1;  -- default
    END IF;

    ------------------------------------------------------------
    -- 1. Get user's pending order
    ------------------------------------------------------------
    SELECT "id"
    INTO v_order_id
    FROM "Order"
    WHERE "userId" = p_user_id
      AND status = 'pending'
    ORDER BY "createdAt" DESC
    LIMIT 1;

    IF v_order_id IS NULL THEN
        RAISE EXCEPTION 'No pending order found for user %', p_user_id;
    END IF;


    ------------------------------------------------------------
    -- 2. Loop through items + join merch to get merch tier
    ------------------------------------------------------------
    FOR rec IN
        SELECT oi."merchId", oi.quantity, m."tierId" AS merchTier
        FROM "OrderItem" oi
        JOIN "Merch" m ON m."merchId" = oi."merchId"
        WHERE oi."orderId" = v_order_id
    LOOP

        -- Add to UserMerch
        INSERT INTO "UserMerch" ("merchId", "userId", "collectedAt")
        VALUES (rec."merchId", p_user_id, NOW());

        -- Lock stock row
        SELECT "quantity"
        INTO v_stock
        FROM "Stock"
        WHERE "merchId" = rec."merchId"
        FOR UPDATE;

        IF v_stock < rec.quantity THEN
            RAISE EXCEPTION 
                'Insufficient stock for merchId %, stock %, needed %',
                rec."merchId", v_stock, rec.quantity;
        END IF;

        -- Reduce stock
        UPDATE "Stock"
        SET quantity = quantity - rec.quantity
        WHERE "merchId" = rec."merchId";

        -- Tier check (compare once per merch)
        IF rec.merchTier = v_user_tier THEN
            v_upgrade := TRUE;
        END IF;

    END LOOP;


    ------------------------------------------------------------
    -- 3. Complete order
    ------------------------------------------------------------
    UPDATE "Order"
    SET status = 'complete'
    WHERE id = v_order_id;


    ------------------------------------------------------------
    -- 4. Delete OrderItems
    ------------------------------------------------------------
    DELETE FROM "OrderItem" WHERE "orderId" = v_order_id;


    ------------------------------------------------------------
    -- 5. Upgrade tier ONCE if required
    ------------------------------------------------------------
    IF v_upgrade THEN
        UPDATE "UserTier"
        SET "tierId" = v_user_tier + 1
        WHERE "userId" = p_user_id;
    END IF;

END;
$$;

`

