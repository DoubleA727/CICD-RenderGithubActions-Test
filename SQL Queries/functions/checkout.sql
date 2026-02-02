-- Drop procedure if it exists
DROP PROCEDURE IF EXISTS checkout_order;

-- Create procedure
CREATE OR REPLACE PROCEDURE checkout_order(
    p_user_id INT,
    p_merch_ids INT[],      -- array of merch IDs being purchased
    p_quantities INT[]      -- array of quantities matching merch_ids
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_tier INT;
    v_total_price DOUBLE PRECISION := 0;
    i INT;
	v_order_id INT;
BEGIN
    -- Add merch to UserMerch
	FOR i IN array_lower(p_merch_ids,1)..array_upper(p_merch_ids,1) LOOP
	    INSERT INTO "UserMerch" ("merchId", "userId", "collectedAt")
	    VALUES (p_merch_ids[i], p_user_id, NOW());
	END LOOP;

	-- SELECT order
	Check if user already has an OPEN order
    SELECT "orderId"
    INTO v_order_id
    FROM "Order"
    WHERE "userId" = p_user_id
      AND status = 'pending'
    ORDER BY "createdAt" DESC
    LIMIT 1;

	-- Update Order table to complete
	UPDATE "Order"
    SET status = 'complete',
        completedAt = NOW()  -- optional column if you track completion date
    WHERE "orderId" = v_order_id;

    -- retreive achievement tier from "Achievement" for specific user (achievementId will represent tier)
	SELECT "achievementId" INTO v_user_tier FROM "UserAchievement" WHERE "userId" = 1 ORDER BY "unlockedAt" ASC LIMIT 1;

	-- unlock next tier
	v_user_tier := v_user_tier + 1;
	INSERT INTO "UserAchievement" ("userId", "achievementId", "unlockedAt") VALUES (p_user_id, v_user_tier, NOW());
END;
$$;
