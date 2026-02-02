module.exports = `
CREATE OR REPLACE FUNCTION post_review(
    p_user_id INTEGER,
    p_merch_id INTEGER,
    p_rating INTEGER,
    p_comments TEXT DEFAULT NULL
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
DECLARE
    new_review_id INTEGER;
BEGIN
    INSERT INTO "Reviews" (
        "userId", 
        "merchId", 
        rating, 
        comments, 
        "createdAt", 
        "updatedAt"
    )
    VALUES (
        p_user_id,
        p_merch_id,
        p_rating,
        p_comments,
        NOW(),
        NOW()
    )
    RETURNING "reviewId" INTO new_review_id;

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
    WHERE r."reviewId" = new_review_id;
END;
$$ LANGUAGE plpgsql;
`