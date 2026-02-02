-- Got dummy datas
SELECT * FROM "Users";

SELECT * FROM "Tier";
SELECT * FROM "CCA";
SELECT * FROM "Merch";
SELECT * FROM "Order";
SELECT * FROM "OrderItem";
SELECT * FROM "Story";
SELECT * FROM "UserTier";
SELECT * FROM "oauth_accounts";

-- No dummy datas
SELECT * FROM "Stock";
SELECT * FROM "Reviews";
SELECT * FROM "UserMerch";
SELECT * FROM "Achievement";
SELECT * FROM "UserAchievement";

SELECT * FROM "_prisma_migrations";

-- Get deleted users
SELECT *
FROM "Users"
WHERE "deletedAt" IS NULL
ORDER BY "createdAt" DESC;


INSERT INTO "Story" (merchId, storyText, tierId)VALUES
(1, "I love it." ,3);

DELETE FROM "Merch" WHERE "merchId" = 6;

-- REVIEWS
ALTER TABLE "Reviews" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "Reviews" DROP CONSTRAINT "Reviews_userId_fkey";
ALTER TABLE "Reviews"
ADD CONSTRAINT "Reviews_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "Users"("userId")
ON DELETE SET NULL;

-- Users
ALTER TABLE "Users" ADD COLUMN "deletedAt" timestamp with time zone;
CREATE UNIQUE INDEX IF NOT EXISTS users_username_active_unique
ON "Users"(username)
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_active_unique
ON "Users"(email)
WHERE "deletedAt" IS NULL;

ALTER TABLE "Users" ALTER COLUMN "firstName" DROP NOT NULL;
ALTER TABLE "Users" ALTER COLUMN "lastName" DROP NOT NULL;
ALTER TABLE "Users" ALTER COLUMN email DROP NOT NULL;   -- only if it's NOT NULL too
ALTER TABLE "Users" ALTER COLUMN password DROP NOT NULL; -- only if it's NOT NULL too
ALTER TABLE "Users" ALTER COLUMN "imageUrl" DROP NOT NULL; -- only if it's NOT NULL too

ALTER TABLE "Story" ALTER COLUMN "merchId" DROP NOT NULL;


DELETE FROM "Story"
WHERE "storyId" = (
  SELECT "storyId"
  FROM "Merch"
  WHERE "merchId" = 2
);



