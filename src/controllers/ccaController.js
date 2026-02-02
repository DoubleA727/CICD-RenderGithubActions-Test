const ccaModel = require("../models/ccaModel");

/**
 * ============================================================
 * GET ALL ACTIVE CCAs
 * - Fetch all CCAs that are enabled/active
 * - Used by the frontend to render the CCA listing page
 * ============================================================
 */
module.exports.getAllCCA = async (req, res) => {
  try {
    const ccaList = await ccaModel.fetchAllCCA(); // DB query
    res.json({ success: true, data: ccaList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ============================================================
 * TRACK CLICK ON A CCA
 * - Increments click counter whenever a CCA modal is opened
 * - Supports analytics (e.g., popularity ranking)
 * ============================================================
 */
module.exports.trackClick = async (req, res) => {
  try {
    await ccaModel.incrementClick(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

/**
 * ============================================================
 * GET CCA STATS (Admin Analytics)
 * - Supports filtering by category
 * - Supports sorting by popularity or alphabetical order
 * - Used in admin dashboard (charts, KPI cards, leaderboard)
 * ============================================================
 */
module.exports.getCCAStats = async (req, res) => {
  const category = req.query.category || "all";
  const sort = req.query.sort || "clicks_desc";

  try {
    const stats = await ccaModel.fetchStats(category, sort);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ============================================================
 * GET ONE CCA BY ID
 * - Used for both admin edit modal and user quick-view modal
 * ============================================================
 */
module.exports.getCCAById = async (req, res) => {
  try {
    const cca = await ccaModel.getCCAById(Number(req.params.id));

    if (!cca) {
      return res.status(404).json({
        success: false,
        message: "CCA not found.",
      });
    }

    res.json({ success: true, data: cca });
  } catch (err) {
    console.error("Get CCA by ID error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching CCA.",
    });
  }
};

/**
 * ============================================================
 * UPDATE CCA (Admin)
 * - Allows editing name, category, description, image URL
 * - Returns 400 if required fields missing
 * - Returns 404 if item doesn't exist
 * ============================================================
 */
module.exports.updateCCA = async (req, res) => {
  const id = Number(req.params.id);
  const { name, category, description, imageUrl } = req.body;

  // Basic server-side validation
  if (!name || !category) {
    return res.status(400).json({
      success: false,
      message: "CCA name and category are required.",
    });
  }

  try {
    const updatedCCA = await ccaModel.updateCCA({
      id,
      name,
      category,
      description,
      imageUrl,
    });

    // Nothing updated → CCA does not exist
    if (!updatedCCA) {
      return res.status(404).json({
        success: false,
        message: "CCA not found.",
      });
    }

    res.json({
      success: true,
      message: "CCA updated successfully.",
      data: updatedCCA,
    });
  } catch (err) {
    console.error("Update CCA error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while updating CCA.",
    });
  }
};

/**
 * ============================================================
 * GET RECOMMENDED CCAs
 * - Returns related CCAs based on category or similarity
 * - Used in user modal (recommended list)
 * ============================================================
 */
module.exports.getCCARecommendations = async (req, res) => {
  try {
    const recs = await ccaModel.getRecommendations(Number(req.params.id));
    res.json({ success: true, data: recs });
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ============================================================
 * DISABLE CCA (Admin)
 * - Soft delete: CCA becomes inactive (isActive = false)
 * - Does NOT remove record from DB
 * - Prevents users from seeing or selecting the CCA
 * ============================================================
 */
module.exports.deleteCCA = async (req, res) => {
  try {
    const cca = await ccaModel.disableCCA(Number(req.params.id));

    if (!cca) {
      return res.status(404).json({
        success: false,
        message: "CCA not found.",
      });
    }

    res.json({
      success: true,
      message: "CCA has been disabled successfully.",
      data: cca,
    });
  } catch (err) {
    console.error("Disable CCA error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while disabling CCA.",
    });
  }
};

/**
 * ============================================================
 * CREATE NEW CCA (Admin)
 * - Requires name + category
 * - Creates a brand new CCA entry
 * ============================================================
 */
module.exports.createCCA = async (req, res) => {
  const { name, category, description, imageUrl } = req.body;

  // Required fields
  if (!name || !category) {
    return res.status(400).json({
      success: false,
      message: "Name and category are required.",
    });
  }

  try {
    const cca = await ccaModel.createCCA({
      name,
      category,
      description,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "CCA created successfully.",
      data: cca,
    });
  } catch (err) {
    console.error("Create CCA error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while creating CCA.",
    });
  }
};

/**
 * ============================================================
 * ENABLE CCA (Admin)
 * - Reverses disableCCA()
 * - Marks CCA as active again so users can see it
 * ============================================================
 */
module.exports.enableCCA = async (req, res) => {
  try {
    const cca = await ccaModel.enableCCA(Number(req.params.id));

    if (!cca) {
      return res.status(404).json({
        success: false,
        message: "CCA not found.",
      });
    }

    res.json({
      success: true,
      message: "CCA enabled successfully.",
      data: cca,
    });
  } catch (err) {
    console.error("Enable CCA error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while enabling CCA.",
    });
  }
};
