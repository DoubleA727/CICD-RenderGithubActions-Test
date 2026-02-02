DROP FUNCTION IF EXISTS public.delete_order(INT, INT);

CREATE OR REPLACE FUNCTION public.delete_order(
    p_user_id  INT,
    p_order_id INT
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_rows_deleted INT;
BEGIN
    IF p_order_id IS NULL THEN
        RAISE EXCEPTION 'order_id is required';
    END IF;

    DELETE FROM "Order"
    WHERE "id"    = p_order_id
      AND "userId" = p_user_id;

    GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;

    IF v_rows_deleted = 0 THEN
        RAISE EXCEPTION 'Order % not found for user %', p_order_id, p_user_id
            USING ERRCODE = 'P0002';  -- no_data_found
    END IF;
END;
$$;
