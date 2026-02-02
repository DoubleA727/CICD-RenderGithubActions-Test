const leaderboardModel = require("../models/leaderboardModel.js");

//GET TOP 10 MOST SPENT
module.exports.getTopSpenders = function (req, res) {
    leaderboardModel.getTopSpenders(function(err, results) {
        if (err) {
            console.error("Error fetching top spenders:", err);
            return res.status(500).json(error);
        }
        else{
            return res.status(200).json(results);
        }
    });
}

//GET TOP 10 MOST BOUGHT MERCHANDISE
module.exports.getTopMerchandise = function (req, res) {
    leaderboardModel.getTopMerchandise(function(err, results) {
        if (err) {
            console.error("Error fetching top merchandise:", err);
            return res.status(500).json(error);
        }
        else{
            return res.status(200).json(results);
        }
    });
}

//GET TOP 10 MOST COLLECTED MERCH
module.exports.getTopCollectedMerch = function (req, res) {
    leaderboardModel.getTopCollectedMerch(function(err, results) {
        if (err) {
            console.error("Error fetching top collected merchandise:", err);
            return res.status(500).json(error);
        }
        else{
            return res.status(200).json(results);
        }
    });
}