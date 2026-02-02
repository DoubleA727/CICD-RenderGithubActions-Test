const express = require('express');
const router = express.Router();

const merchController = require('../controllers/merchController');

// GET all merch
router.get("/all", merchController.getAllMerch);
// 1) GET /merch
router.post('/getAllMerch', merchController.getMerch);
// 2) POST /merch
router.post('/getMerchByTier', merchController.getMerchByTier);

// LIMITED MERCH ROUTE
router.get("/limited", merchController.getLimitedMerch);

router.get("/:merchId", merchController.getMerchById);


module.exports = router;
