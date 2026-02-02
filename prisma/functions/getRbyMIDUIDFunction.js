module.exports = `
CREATE OR REPLACE FUNCTION get_reviews_by_merchid_and_userid(
    p_user_id INTEGER,
    p_merch_id INTEGER
)
RETURNS TABLE(
    review_id INTEGER,
    user_id INTEGER,
    merch_id INTEGER,
    rating INTEGER,
    comments TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r."reviewId",
        r."userId",
        r."merchId",
        r.rating,
        r.comments,
        r."createdAt",
        r."updatedAt"
    FROM "Reviews" r
    WHERE r."merchId" = p_merch_id 
      AND r."userId" = p_user_id
    ORDER BY r."createdAt" DESC;
END;
$$ LANGUAGE plpgsql;
`