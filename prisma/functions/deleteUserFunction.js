module.exports =`
CREATE OR REPLACE FUNCTION deleteUser(p_user_id INT)
RETURNS INT AS $$
DECLARE
    deleted_count INT;
BEGIN
    DELETE FROM "Users"
    WHERE "userId" = p_user_id
    RETURNING 1 INTO deleted_count;

    -- If no row was deleted, set count to 0
    IF deleted_count IS NULL THEN
        deleted_count := 0;
    END IF;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
`