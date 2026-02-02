const express = require('express');
const router = express.Router();

const leaderboardController = require('../controllers/leaderboardController.js');

// 1) GET /leaderboard Top Spenders
router.get('/TopSpenders', leaderboardController.getTopSpenders);
// 1.5) GET /leaderboard Top Merchandise
router.get('/TopMerchandise', leaderboardController.getTopMerchandise);
// 1.75 GET /leaderboard Top Most Collected Merch
router.get('/TopCollectedMerch', leaderboardController.getTopCollectedMerch);

module.exports = router;
