const pool = require('../services/db')
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// Find review by ID
module.exports.findReviewById = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT r."reviewId", r."userId", u."username", u."firstName" AS "userfirstname", u."lastName" AS "userlastname",
               r."merchId", m."name" AS "merchname", m."imageUrl" AS "merchimage",
               r."rating", r."comments", r."createdAt", r."updatedAt"
        FROM "Reviews" r
        JOIN "Users" u ON r."userId" = u."userId"
        JOIN "Merch" m ON r."merchId" = m."merchId"
        WHERE r."reviewId" = $1
    `;
    const VALUES = [data.reviewId];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

//by uid
module.exports.getReviewsByUserId = function(data, callback) {
    const sql = `
        SELECT r.*, 
            m."name" AS merchName, 
            m."description" AS merchDescription, 
            m."imageUrl" AS merchImage,
            u."username", 
            u."firstName" AS userFirstName, 
            u."lastName" AS userLastName,
            u."email"
        FROM "Reviews" r
        JOIN "Merch" m ON r."merchId" = m."merchId"
        JOIN "Users" u ON r."userId" = u."userId"
        WHERE r."userId" = $1
        ORDER BY r."createdAt" DESC;
    `;
    const VALUES = [data.userId];

    pool.query(sql, VALUES, callback);
};

//by mid
module.exports.getReviewsByMerchId = function(data, callback) {
    const sql = `
        SELECT r.*, 
            m."name" AS merchName, 
            m."description" AS merchDescription, 
            m."imageUrl" AS merchImage,
            u."username", 
            u."firstName" AS userFirstName, 
            u."lastName" AS userLastName,
            u."email"
        FROM "Reviews" r
        JOIN "Merch" m ON r."merchId" = m."merchId"
        JOIN "Users" u ON r."userId" = u."userId"
        WHERE r."merchId" = $1
        ORDER BY r."createdAt" DESC;
    `;
    const VALUES = [data.merchId];

    pool.query(sql, VALUES, callback);
};

//um by uid
module.exports.getUserMerchByUID = function(data, callback) {
    const sql = `
        SELECT um.*, m."name" AS merchName
        FROM "UserMerch" um
        JOIN "Merch" m ON um."merchId" = m."merchId"
        WHERE um."userId" = $1
        ORDER BY um."collectedAt" DESC
    `;

    const values = [data.userId];

    pool.query(sql, values, callback);
};

//MIDDLEWARES FOR POST/PUT
module.exports.checkUserMerchOwnership = function(data, callback){
    const SQLSTATEMENT = `
        SELECT * FROM "UserMerch"
        WHERE "userId" = $1 AND "merchId" = $2
        LIMIT 1;
    `;
    const VALUES = [data.userId, data.merchId];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

module.exports.getReviewsByMerchIdAndUserId = function(data, callback){
    const SQLSTATEMENT = `
        SELECT * FROM get_reviews_by_merchid_and_userid($1, $2);
    `;

    const VALUES = [data.userId, data.merchId];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

//POST
module.exports.postReview = function(data, callback){
    const SQLSTATEMENT = `
        SELECT * FROM post_review($1, $2, $3, $4)
    `
    const VALUES = [data.userId, data.merchId, data.rating, data.comments];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

//PUT
module.exports.editReview = function(data, callback){
    const SQLSTATEMENT = `
        SELECT * FROM edit_review($1, $2, $3);
    `;
    const VALUES = [data.reviewId, data.rating, data.comments];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

//DELETE
module.exports.deleteReview = function(data, callback){
    const SQLSTATEMENT = `
        DELETE FROM "Reviews"
        WHERE "userId" = $1 AND "merchId" = $2
        RETURNING *;
    `;
    const VALUES = [data.userId, data.merchId];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

//REVIEW COMMENTS
//get comments by reviewId
module.exports.getReviewCommentsByReviewId = function(data, callback){
    // console.log("DATA IN GET COMMENT MODEL:", data);
    const SQLSTATEMENT = `
        SELECT 
            rc.*,
            u.username,
            u."imageUrl" AS "UserPFP"
        FROM "ReviewComments" rc
        JOIN "Users" u ON rc."userId" = u."userId"
        WHERE rc."reviewId" = $1
        ORDER BY rc."createdAt" DESC;
    `;
    const VALUES = [data.reviewId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

//post comment
module.exports.postReviewComment = function(data, callback){
    // console.log("DATA IN MODEL:", data);
    const SQLSTATEMENT = `
        INSERT INTO "ReviewComments" ("reviewId", "userId", "comment", "imageUrl")
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const VALUES = [data.reviewId, data.userId, data.comment, data.image];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

//edit reviewComment
module.exports.editReviewComment = function(data, callback){
    const SQLSTATEMENT = `
        UPDATE "ReviewComments"
        SET "comment" = $1, "updatedAt" = NOW()
        WHERE "commentId" = $2
        RETURNING *;
    `;
    console.log("DATA IN EDIT COMMENT MODEL:", data);
    const VALUES = [data.comment, data.commentId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

//delete reviewComment
module.exports.deleteReviewComment = function(data, callback){
    const SQLSTATEMENT = `
        DELETE FROM "ReviewComments"
        WHERE "commentId" = $1 AND "userId" = $2
        RETURNING *;
    `;
    const VALUES = [data.commentId, data.userId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
