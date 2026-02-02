CREATE OR REPLACE FUNCTION get_merch_by_cca_tier(
    p_ccaId INT,
    p_tierId INT
)
RETURNS TABLE (
    merch_name text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT m."name"
    FROM "Merch" m
    WHERE m."ccaId" = p_ccaId
      OR m."tierId" = p_tierId;
END;
$$;
