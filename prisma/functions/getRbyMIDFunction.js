module.exports = `
CREATE OR REPLACE FUNCTION get_reviews_by_merchid(p_merch_id INT)
RETURNS TABLE (
    "reviewId" INT,
    "userId" INT,
    "username" TEXT,
    "merchId" INT,
    "rating" INT,
    "comments" TEXT,
    "createdAt" TIMESTAMP,
    "updatedAt" TIMESTAMP
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r."reviewId",
        r."userId",
        u."username",
        r."merchId",
        r."rating",
        r."comments",
        r."createdAt",
        r."updatedAt"
    FROM "Reviews" r
    JOIN "Users" u ON r."userId" = u."userId"
    WHERE r."merchId" = p_merch_id
    ORDER BY r."createdAt" DESC;
END;
$$ LANGUAGE plpgsql;
`