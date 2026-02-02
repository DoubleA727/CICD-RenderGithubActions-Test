module.exports = `
CREATE OR REPLACE FUNCTION get_user_details_joined(p_user_id INT)
RETURNS TABLE (
  userId INT,
  username TEXT,
  firstName TEXT,
  lastName TEXT,
  email TEXT,
  imageUrl TEXT,
  createdAt TIMESTAMP,
  
  achievementId INT,
  achievement_name TEXT,
  achievement_description TEXT,
  unlockedAt TIMESTAMP,
  
  merchId INT,
  merch_name TEXT,
  merch_price FLOAT,
  collectedAt TIMESTAMP,
  
  order_id INT,
  shippingPrice FLOAT,
  totalPrice FLOAT,
  order_createdAt TIMESTAMP,
  
  order_item_id INT,
  order_merchId INT,
  quantity INT,
  subtotal FLOAT
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u."userId",
    u."username",
    u."firstName",
    u."lastName",
    u."email",
    u."imageUrl",
    u."createdAt",

    a."achievementId",
    a."name"        AS achievement_name,
    a."description" AS achievement_description,
    ua."unlockedAt",

    m."merchId",
    m."name"        AS merch_name,
    m."price"       AS merch_price,
    um."collectedAt",

    o."id"          AS order_id,
    o."shippingPrice",
    o."totalPrice",
    o."createdAt"   AS order_createdAt,

    oi."id"         AS order_item_id,
    oi."merchId"    AS order_merchId,
    oi."quantity",
    oi."subtotal"

  FROM "Users" u
  LEFT JOIN "UserAchievement" ua ON u."userId" = ua."userId"
  LEFT JOIN "Achievement" a ON ua."achievementId" = a."achievementId"
  LEFT JOIN "UserMerch" um ON u."userId" = um."userId"
  LEFT JOIN "Merch" m ON um."merchId" = m."merchId"
  LEFT JOIN "Order" o ON u."userId" = o."userId"
  LEFT JOIN "OrderItem" oi ON o."id" = oi."orderId"
  WHERE u."userId" = p_user_id;
END;
$$ LANGUAGE plpgsql;`