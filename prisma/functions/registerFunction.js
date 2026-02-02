module.exports = `
CREATE OR REPLACE FUNCTION public.register(
    p_username   TEXT,
    p_first_name TEXT,
    p_last_name  TEXT,
    p_email      TEXT,
    p_password   TEXT,
    p_image_url  TEXT DEFAULT 'https://example.com/default-avatar.png'
)
RETURNS TABLE(success BOOLEAN, message TEXT, user_id INT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_username TEXT := NULLIF(trim(p_username), '');
    v_first    TEXT := NULLIF(trim(p_first_name), '');
    v_last     TEXT := NULLIF(trim(p_last_name), '');
    v_email    TEXT := NULLIF(trim(p_email), '');
    v_pass     TEXT := NULLIF(trim(p_password), '');
    v_img      TEXT := NULLIF(trim(p_image_url), '');
    v_uid      INT;
BEGIN
    -- require all non-nullable fields
    IF v_username IS NULL
       OR v_first IS NULL
       OR v_last IS NULL
       OR v_email IS NULL
       OR v_pass IS NULL
       OR v_img IS NULL THEN
        RETURN QUERY SELECT FALSE, 'All fields are required.', NULL::INT;
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM "Users" WHERE lower("username") = lower(v_username)) THEN
        RETURN QUERY SELECT FALSE, 'Username already exists.', NULL::INT;
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM "Users" WHERE lower("email") = lower(v_email)) THEN
        RETURN QUERY SELECT FALSE, 'Email already exists.', NULL::INT;
        RETURN;
    END IF;

    -- TODO: hash v_pass before insert (e.g., in app layer)
    INSERT INTO "Users" ("username", "firstName", "lastName", "email", "password", "imageUrl", "createdAt")
    VALUES (v_username, v_first, v_last, v_email, v_pass, v_img, NOW())
    RETURNING "userId" INTO v_uid;

	-- Add new user to UserTier
	INSERT INTO "UserTier" ("userId", "tierId") VALUES (v_uid, 1);

    RETURN QUERY SELECT TRUE, 'Registration successful.', v_uid;
    RETURN;

EXCEPTION
    WHEN unique_violation THEN
        RETURN QUERY SELECT FALSE, 'Username or email already exists.', NULL::INT;
    WHEN OTHERS THEN
        RETURN QUERY SELECT FALSE, 'Registration failed. Please try again.', NULL::INT;
END;
$$;

`

