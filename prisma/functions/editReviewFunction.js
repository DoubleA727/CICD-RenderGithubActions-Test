module.exports = `
CREATE OR REPLACE FUNCTION edit_review(
    p_review_id INTEGER,
    p_rating INTEGER,
    p_comments TEXT
)
RETURNS TABLE (
    reviewId INTEGER,
    userId INTEGER,
    merchId INTEGER,
    rating INTEGER,
    comments TEXT,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    UPDATE "Reviews" r
    SET rating = p_rating,
        comments = p_comments,
        "updatedAt" = NOW()
    WHERE r."reviewId" = p_review_id
    RETURNING r."reviewId", r."userId", r."merchId", r.rating, r.comments, r."createdAt", r."updatedAt";
END;
$$ LANGUAGE plpgsql;
`