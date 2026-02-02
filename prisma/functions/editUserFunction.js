module.exports=`
CREATE OR REPLACE FUNCTION editUser(
    p_user_id INT,
    p_username TEXT,
    p_firstName TEXT,
    p_lastName TEXT,
    p_email TEXT,
    p_password TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE "Users"
    SET 
        "username"  = COALESCE(p_username, "username"),
        "firstName" = COALESCE(p_firstName, "firstName"),
        "lastName"  = COALESCE(p_lastName, "lastName"),
        "email"     = COALESCE(p_email, "email"),
        "password"  = COALESCE(p_password, "password")
    WHERE "userId" = p_user_id;
END;
$$;
`