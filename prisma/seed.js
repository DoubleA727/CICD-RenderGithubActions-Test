const prisma = require('../src/services/prismaClient');

// SQL Function
const addToCartFunction = require('./functions/addToCartFunction');
const checkoutOrderProcedure = require('./functions/checkoutOrderProcedure');
const deleteOrderFunction = require('./functions/deleteOrderFunction');
const deleteOrderItemFunction = require('./functions/deleteOrderItemFunction');
const deleteUserFunction = require('./functions/deleteUserFunction');
const editReviewFunction = require('./functions/editReviewFunction');
const editUserFunction = require('./functions/editUserFunction');
const findUserByIdFunction = require('./functions/findUserByIdFunction');
const getCCANameForPostFunction = require('./functions/getCCANameForPostFunction');
const getOrderFunction = require('./functions/getOrderFunction');
const getRbyMIDFunction = require('./functions/getRbyMIDFunction');
const getRbyMIDUIDFunction = require('./functions/getRbyMIDUIDFunction');
const getUserDetailsJoinedFunction = require('./functions/getUserDetailsJoinedFunction');
const loginFunction = require('./functions/loginFunction');
const postCCAFunction = require('./functions/postCCAFunction');
const postReviewFunction = require('./functions/postReviewFunction');
const registerFunction = require('./functions/registerFunction');
const updateOrderFunction = require('./functions/updateOrderFunction');
const updateOrderItemFunction = require('./functions/updateOrderItemFunction');
const addCustomToCartReturnItemFunction = require('./functions/addCustomToCartReturnItemFunction');



// Seed SQL
const storySeedSQL = require('./data/initStory');
const ccaSeedSQL = require('./data/initCCA');
const tierSeedSQL = require('./data/initTier');
const merchSeedSQL = require('./data/initMerch');
const orderSeedSQL = require('./data/initOrders');
const orderItemSeedSQL = require('./data/initOrderItems');
const userTierSeedSQL = require('./data/initUserTier');

async function runSqlFunctions() {
  try {
    console.log("Creating SQL functions...");
    await prisma.$executeRawUnsafe(loginFunction);
    console.log("loginFunction created");
    await prisma.$executeRawUnsafe(registerFunction);
    console.log("registerFunction created");
    await prisma.$executeRawUnsafe(updateOrderFunction);
    console.log("updateOrderFunction created");
    await prisma.$executeRawUnsafe(deleteOrderFunction);
    console.log("deleteOrderFunction created");
    await prisma.$executeRawUnsafe(getUserDetailsJoinedFunction);
    console.log("getUserDetailsJoinedFunction created");
    await prisma.$executeRawUnsafe(checkoutOrderProcedure);
    console.log("checkout_order procedure created");
    await prisma.$executeRawUnsafe(addToCartFunction);
    console.log("addToCartFunction created");
    await prisma.$executeRawUnsafe(deleteUserFunction);
    console.log("deleteUserFunction created");
    await prisma.$executeRawUnsafe(editReviewFunction);
    console.log("editReviewFunction created");
    await prisma.$executeRawUnsafe(editUserFunction);
    console.log("editUserFunction created");
    await prisma.$executeRawUnsafe(getCCANameForPostFunction);
    console.log("getCCANameForPostFunction created");
    await prisma.$executeRawUnsafe(getOrderFunction);
    console.log("getOrderFunction created");
    await prisma.$executeRawUnsafe(getRbyMIDFunction);
    console.log("getRbyMIDFunction created");
    await prisma.$executeRawUnsafe(getRbyMIDUIDFunction);
    console.log("getRbyMIDUIDFunction created");
    await prisma.$executeRawUnsafe(postCCAFunction);
    console.log("postCCAFunction created");
    await prisma.$executeRawUnsafe(postReviewFunction);
    console.log("postReviewFunction created");
    await prisma.$executeRawUnsafe(updateOrderItemFunction);
    console.log("updateOrderItemFunction created");
    await prisma.$executeRawUnsafe(deleteOrderItemFunction);
    console.log("deleteOrderItemFunction created");
    await prisma.$executeRawUnsafe(findUserByIdFunction);
    console.log("findUserByIdFunction created");
    await prisma.$executeRawUnsafe(addCustomToCartReturnItemFunction);
    console.log("addToCartReturnItemFunction created");




    console.log("\nSeeding dummy data...");
    await prisma.$executeRawUnsafe(ccaSeedSQL);
    console.log("CCA seeded");
    await prisma.$executeRawUnsafe(tierSeedSQL);
    console.log("Tier seeded");
    await prisma.$executeRawUnsafe(storySeedSQL);
    console.log("Story seeded");
    await prisma.$executeRawUnsafe(userTierSeedSQL);
    console.log("User Tier seeded");
    await prisma.$executeRawUnsafe(merchSeedSQL);
    console.log("Merch seeded");
    await prisma.$executeRawUnsafe(orderSeedSQL);
    console.log("Order seeded");
    await prisma.$executeRawUnsafe(orderItemSeedSQL);
    console.log("Order Items seeded");

    console.log("\nSQL functions + dummy data inserted successfully.");
  } catch (err) {
    console.error("\nError running SQL script:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runSqlFunctions();
