module.exports = `
CREATE OR REPLACE FUNCTION public.update_order(
    p_user_id        INT,
    p_order_id       INT,
    p_shipping_price NUMERIC,
    p_total_price    NUMERIC
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_rows_updated INT;
BEGIN
    -- Basic guard: missing order id
    IF p_order_id IS NULL THEN
        RAISE EXCEPTION 'order_id is required';
    END IF;

    -- Optional: basic validation on prices
    IF p_shipping_price IS NOT NULL AND p_shipping_price < 0 THEN
        RAISE EXCEPTION 'shipping_price cannot be negative';
    END IF;

    IF p_total_price IS NOT NULL AND p_total_price < 0 THEN
        RAISE EXCEPTION 'total_price cannot be negative';
    END IF;

    -- Update only the fields that are not null (COALESCE keeps current values)
    UPDATE "Order"
    SET
        "shippingPrice" = COALESCE(p_shipping_price, "shippingPrice"),
        "totalPrice"    = COALESCE(p_total_price, "totalPrice")
    WHERE
        "id"     = p_order_id
        AND "userId" = p_user_id;

    -- Check if anything was actually updated
    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

    IF v_rows_updated = 0 THEN
        -- Either order doesn't exist OR doesn't belong to this user
        RAISE EXCEPTION 'Order % not found for user %', p_order_id, p_user_id
            USING ERRCODE = 'P0002';  -- no_data_found
    END IF;

END;
$$;
`;