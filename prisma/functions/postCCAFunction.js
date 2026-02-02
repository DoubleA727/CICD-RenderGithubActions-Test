module.exports=`
CREATE OR REPLACE FUNCTION postCCA(
    p_name TEXT,
    p_description TEXT
)
RETURNS JSON AS $$
DECLARE
    newCCA RECORD;
BEGIN
    INSERT INTO "CCA" ("name", "description")
    VALUES (p_name, p_description)
    RETURNING "ccaId", "name", "description"
    INTO newCCA;

    RETURN json_build_object(
        'name', newCCA.name,
        'description', newCCA.description
    );
END;
$$ LANGUAGE plpgsql;
`