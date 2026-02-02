const merchModel = require("../models/merchModel");

// Get ALL merch
module.exports.getAllMerch = (req, res) => {
  merchModel.getAllMerch((err, result) => {
    if (err) {
      console.error("Error fetching merch:", err);
      return res
        .status(500)
        .json({ message: "Server error fetching merch.", error: err.message });
    }

    return res.status(200).json({
      data: result.rows, // admin.js already handles data.data / data.result etc.
    });
  });
};

// Get all merch by cca
module.exports.getMerch = (req, res) => {
    const { ccaId } = req.query;
    const userTier = req.userTier;

    if (!ccaId) {
        return res.status(400).json({ message: "Missing ccaId." });
    }

    const data = {
        ccaId,
        userTier
    };

    merchModel.gettingMerch(data, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Database error", error });
        }

        return res.status(200).json({
            message: "Retreived Merch", result: results.rows
        });
    });
};

// Get merch by tier
module.exports.getMerchByTier = (req, res) => {

    const tier = req.body.tier;
    const { ccaId } = req.query;

    if (!ccaId) {
        return res.status(400).json({ message: "Missing ccaId." });
    }

    if (!tier) {
        return res.status(400).json({ message: "Missing tier." });
    }

    const data = {
        tier,
        ccaId
    };

    merchModel.gettingMerchByTier(data, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Database error", error });
        }

        return res.status(200).json({
            message: "Retreived Merch", result: results.rows
        });
    });
};

// Get limited deals merch (3 random items)
module.exports.getLimitedMerch = async (req, res) => {
  try {
    const results = await merchModel.getLimitedMerch();

    return res.status(200).json({
      message: "Retrieved limited merch",
      result: results
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Database error",
      error
    });
  }
};

module.exports.getMerchById = (req, res) => {
  const merchId = req.params.merchId;

  if (!merchId || isNaN(Number(merchId))) {
    return res.status(400).json({ message: "Valid merchId is required." });
  }

  merchModel.getMerchById(merchId, (err, result) => {
    if (err) {
      console.error("Error fetching merch by id:", err);
      return res
        .status(500)
        .json({ message: "Server error.", error: err.message });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Merch not found." });
    }

    return res.status(200).json({ data: result.rows[0] });
  });
};
