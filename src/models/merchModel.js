const pool = require('../services/db');
const prisma = require("../services/prismaClient");

// Get all merch with joined Story (for admin listing & public views)
module.exports.getAllMerch = (callback) => {
  const SQL = `
    SELECT 
      m."merchId",
      m.name,
      m.description,
      m.price,
      m."imageUrl",
      m."ccaId",
      m."tierId",
      m."isActive",
      m."storyId",
      s."storyText"
    FROM "Merch" m
    LEFT JOIN "Story" s
      ON m."storyId" = s."storyId"
    ORDER BY m."merchId" ASC;
  `;

  pool.query(SQL, [], callback);
};

// 1) GET /api/merch
module.exports.gettingMerch = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT "tierId", "name", "description", "price", "imageUrl" FROM "Merch" WHERE "ccaId"=?;
  `;
  const VALUES = [data.ccaId];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// 2) POST /api/merch
module.exports.gettingMerchByTier = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT "merchId", "tierId", "name", "description", "price", "imageUrl" FROM "Merch" WHERE "tierId"= ? AND "ccaId"=?;
  `;
  const VALUES = [data.tier, data.ccaId];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// Get 3 random merch for limited deals


module.exports.getLimitedMerch = async function () {
  return prisma.$queryRaw`
    SELECT "merchId", "name", "description", "price", "imageUrl"
    FROM "Merch"
    ORDER BY RANDOM()
    LIMIT 3;
  `;
};

// Get a single merch by id, if you need it elsewhere
module.exports.getMerchById = (merchId, callback) => {
  const SQL = `
    SELECT 
      m."merchId",
      m.name,
      m.description,
      m.price,
      m."imageUrl",
      m."ccaId",
      m."tierId",
      m."isActive",
      m."storyId",
      s."storyText"
    FROM "Merch" m
    LEFT JOIN "Story" s
      ON m."storyId" = s."storyId"
    WHERE m."merchId" = $1;
  `;

  pool.query(SQL, [merchId], callback);
};
