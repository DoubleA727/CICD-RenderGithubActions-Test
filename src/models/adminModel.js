// models/adminModel.js
const pool = require("../services/db");

// CREATE merch + story
// data: { name, description, price, imageUrl, ccaId, tierId, storyText }
module.exports.createMerch = (data, callback) => {
  // Insert Story first (Story.tierId is NOT NULL, tierId is required 1–3)
  const storySql = `
        INSERT INTO "Story"
            ("storyText", "tierId")
        VALUES
            ($1, $2)
        RETURNING "storyId";
    `;

  const storyValues = [data.storyText || "", data.tierId];

  pool.query(storySql, storyValues, (err, storyResult) => {
    if (err) {
      return callback(err);
    }

    const storyId = storyResult.rows[0].storyId;

    // Insert Merch with this storyId
    const merchSql = `
            INSERT INTO "Merch"
                ("tierId", "storyId", "ccaId", name, description, price, "imageUrl", "isActive")
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, true)
            RETURNING "merchId";
        `;

    const merchValues = [
      data.tierId,
      storyId,
      data.ccaId,
      data.name,
      data.description || null,
      data.price,
      data.imageUrl,
    ];

    pool.query(merchSql, merchValues, (err2, merchResult) => {
      if (err2) {
        return callback(err2);
      }

      const merchId = merchResult.rows[0].merchId;

      return callback(null, {
        merchId,
        storyId,
      });
    });
  });
};

// optional helper to check duplicate merch name per CCA
module.exports.findMerchByNameAndCca = (ccaId, name, callback) => {
  const SQL = `
        SELECT *
        FROM "Merch"
        WHERE "ccaId" = $1 AND name = $2
    `;
  pool.query(SQL, [ccaId, name], callback);
};

// check duplicate merch name per CCA, excluding a specific merchId
module.exports.findMerchByNameAndCcaExcludingId = (
  ccaId,
  name,
  merchId,
  callback
) => {
  const SQL = `
        SELECT *
        FROM "Merch"
        WHERE "ccaId" = $1
          AND name = $2
          AND "merchId" <> $3
    `;
  pool.query(SQL, [ccaId, name, merchId], callback);
};

// UPDATE merch (no storyId change here)
module.exports.updateMerch = (data, callback) => {
  const SQL = `
        UPDATE "Merch"
        SET
            "ccaId" = $1,
            "tierId" = $2,
            name = $3,
            description = $4,
            price = $5,
            "imageUrl" = $6
        WHERE "merchId" = $7
        RETURNING *;
    `;

  const VALUES = [
    data.ccaId,
    data.tierId,
    data.name,
    data.description,
    data.price,
    data.imageUrl,
    data.merchId,
  ];

  pool.query(SQL, VALUES, callback);
};

// UPDATE the Story row belonging to a merchId
// data: { merchId, storyText, tierId }
module.exports.updateStoryForMerch = (data, callback) => {
  const SQL = `
        UPDATE "Story"
        SET
            "storyText" = $1,
            "tierId"    = $2
        WHERE "storyId" = (
            SELECT "storyId"
            FROM "Merch"
            WHERE "merchId" = $3
        )
        RETURNING *;
    `;

  const VALUES = [data.storyText, data.tierId, data.merchId];

  pool.query(SQL, VALUES, callback);
};

// Archive merch (soft delete)
module.exports.archiveMerch = (merchId, callback) => {
  const SQL = `
        UPDATE "Merch"
        SET "isActive" = false
        WHERE "merchId" = $1
        RETURNING *;
    `;

  pool.query(SQL, [merchId], callback);
};

// Unarchive merch (set isActive = true)
module.exports.unarchiveMerch = (merchId, callback) => {
  const SQL = `
        UPDATE "Merch"
        SET "isActive" = true
        WHERE "merchId" = $1
        RETURNING *;
    `;

  pool.query(SQL, [merchId], callback);
};


// VerifyAdmin middleware helper
module.exports.verifyAdmin = (userId, callback) => {
  const SQL = `
        SELECT role
        FROM "Users"
        WHERE "userId" = $1
        LIMIT 1;
    `;

  pool.query(SQL, [userId], callback);
};
