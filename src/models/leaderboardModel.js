const pool = require('../services/db')

module.exports.getTopSpenders = function(callback) {
    const SQLSTATEMENT = `
        SELECT u."userId", SUM(o."totalPrice") AS totalSpent, u."username", u."firstName", u."lastName", u."imageUrl"
        FROM "Order" o
        JOIN "Users" u ON o."userId" = u."userId"
        GROUP BY u."userId"
        ORDER BY totalSpent DESC
        LIMIT 10
    `;
    pool.query(SQLSTATEMENT, callback);
}

module.exports.getTopMerchandise = function(callback) {
    const SQLSTATEMENT = `
        SELECT m."merchId", m."name", SUM(oi."quantity") AS totalBought, m."imageUrl"
        FROM "OrderItem" oi
        JOIN "Merch" m ON oi."merchId" = m."merchId"
        GROUP BY m."merchId"
        ORDER BY totalBought DESC
        LIMIT 10
    `;
    pool.query(SQLSTATEMENT, callback);
}

module.exports.getTopCollectedMerch = function(callback) {
    const SQLSTATEMENT = `
        SELECT
        u."userId",
        u."username",
        u."firstName",
        u."lastName",
        u."imageUrl",
        COUNT(um."merchId") AS "totalCollected"
        FROM "UserMerch" um
        JOIN "Users" u ON um."userId" = u."userId"
        GROUP BY
        u."userId",
        u."username",
        u."firstName",
        u."lastName",
        u."imageUrl"
        ORDER BY "totalCollected" DESC
        LIMIT 10;
    `;
    pool.query(SQLSTATEMENT, callback);
}