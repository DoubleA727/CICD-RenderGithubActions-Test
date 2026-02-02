module.exports=`
CREATE OR REPLACE FUNCTION getCCAByName(
	    p_name TEXT
)
RETURNS JSON AS $$
DECLARE
    foundCCA RECORD;
BEGIN
    SELECT "ccaId", "name", "description"
    INTO foundCCA
    FROM "CCA"
    WHERE "name" = p_name
    LIMIT 1;

    IF foundCCA IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN json_build_object(
        'name', foundCCA.name,
        'description', foundCCA.description
    );
END;
$$ LANGUAGE plpgsql;
`
