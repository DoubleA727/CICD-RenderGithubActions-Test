CREATE OR REPLACE FUNCTION public.find_user_for_login(p_identifier TEXT)
RETURNS TABLE(
  "userId"   INT,
  "username" TEXT,
  "email"    TEXT,
  "password" TEXT,
  "role"	 TEXT
)
LANGUAGE sql
AS $$
  SELECT "userId", "username", "email", "password", "role"
  FROM "Users"
  WHERE lower("username") = lower(p_identifier)
     OR lower("email")    = lower(p_identifier)
  LIMIT 1;
$$;