// src/controllers/adminController.js
const adminModel = require("../models/adminModel.js");

// POST /api/admin/merch
// Create merch + story (image uploaded by Cloudinary+Multer)
module.exports.createMerch = (req, res) => {
  try {
    const {
      name,
      description,
      price,
      ccaId,
      tierId,
      storyText,
    } = req.body;

    const priceNum = Number(price);
    const ccaIdNum = Number(ccaId);
    const tierIdNum = Number(tierId);

    if (!name || !price || !ccaId || !tierId) {
      return res.status(400).json({
        message: "name, price, ccaId and tierId are required.",
      });
    }

    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: "Invalid price." });
    }

    if (!Number.isInteger(ccaIdNum) || ccaIdNum <= 0) {
      return res.status(400).json({ message: "Invalid ccaId." });
    }

    if (!Number.isInteger(tierIdNum) || tierIdNum < 1 || tierIdNum > 3) {
      return res
        .status(400)
        .json({ message: "tierId must be an integer between 1 and 3." });
    }

    // Multer + Cloudinary gives us the URL in req.file.path
    const imageUrl = req.file && req.file.path;

    if (!imageUrl) {
      return res.status(400).json({
        message: "Image file is required.",
      });
    }

    const data = {
      name,
      description: description || null,
      price: priceNum,
      imageUrl,
      ccaId: ccaIdNum,
      tierId: tierIdNum,
      storyText: storyText || "",
    };

    adminModel.createMerch(data, (err, result) => {
      if (err) {
        console.error("Error creating merch with story:", err);

        if (err.code === "23505") {
          return res.status(400).json({
            message:
              "Duplicate constraint error (likely story/merch linkage).",
            error: err.detail,
          });
        }

        return res.status(500).json({
          message: "Server error creating merch.",
          error: err.message,
        });
      }

      return res.status(201).json({
        message: "Merch created successfully.",
        merchId: result.merchId,
        storyId: result.storyId,
      });
    });
  } catch (err) {
    console.error("Unexpected error in createMerch:", err);
    return res.status(500).json({
      message: "Server error creating merch.",
      error: err.message,
    });
  }
};

// PUT /api/admin/merch/:merchId
module.exports.editMerch = (req, res) => {
  try {
    const merchId = req.params.merchId;
    const {
      name,
      description,
      price,
      ccaId,
      tierId,
      storyText,
      existingImageUrl, // sent from frontend
    } = req.body;

    if (!merchId) {
      return res.status(400).json({ message: "merchId param is required." });
    }

    const priceNum = Number(price);
    const ccaIdNum = Number(ccaId);
    const tierIdNum = Number(tierId);

    if (!name || !price || !ccaId || !tierId) {
      return res.status(400).json({
        message: "name, price, ccaId and tierId are required.",
      });
    }

    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return res.status(400).json({ message: "Invalid price." });
    }

    if (!Number.isInteger(ccaIdNum) || ccaIdNum <= 0) {
      return res.status(400).json({ message: "Invalid ccaId." });
    }

    if (!Number.isInteger(tierIdNum) || tierIdNum < 1 || tierIdNum > 3) {
      return res
        .status(400)
        .json({ message: "tierId must be an integer between 1 and 3." });
    }

    // Decide which image URL to use:
    // - If a new file is uploaded, use Cloudinary URL from req.file.path
    // - Otherwise, keep the existingImageUrl from the form
    let imageUrl = existingImageUrl || null;

    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    }

    if (!imageUrl) {
      return res.status(400).json({
        message:
          "Image URL is missing. Upload a new image or keep the existing one.",
      });
    }

    // Check for duplicate merch name per CCA, excluding this merchId
    adminModel.findMerchByNameAndCcaExcludingId(
      ccaIdNum,
      name,
      merchId,
      (err, result) => {
        if (err) {
          console.error("Error checking duplicate merch name:", err);
          return res.status(500).json(err);
        }

        if (result.rows.length > 0) {
          return res.status(409).json({
            message: `Merch with name "${name}" already exists for this CCA.`,
          });
        }

        const merchData = {
          merchId,
          name,
          description: description || null,
          price: priceNum,
          imageUrl,
          ccaId: ccaIdNum,
          tierId: tierIdNum,
        };

        // 1) Update MERCH
        adminModel.updateMerch(merchData, (err2, result2) => {
          if (err2) {
            console.error("Error updating merch:", err2);
            return res.status(500).json(err2);
          }

          if (result2.rows.length === 0) {
            return res.status(404).json({
              message: "Merch not found.",
            });
          }

          const updatedMerch = result2.rows[0];

          // 2) If storyText provided, update STORY as well
          if (storyText && storyText.trim() !== "") {
            const storyData = {
              merchId,
              storyText: storyText.trim(),
              tierId: tierIdNum, // keep Story.tierId in sync with merch tierId
            };

            adminModel.updateStoryForMerch(
              storyData,
              (err3, storyResult) => {
                if (err3) {
                  console.error("Error updating story for merch:", err3);
                  return res.status(500).json(err3);
                }

                return res.status(200).json({
                  message: "Merch and story updated successfully",
                  merch: updatedMerch,
                  story: storyResult.rows[0],
                });
              }
            );
          } else {
            // No story text submitted -> only merch updated
            return res.status(200).json({
              message: "Merch updated successfully",
              merch: updatedMerch,
            });
          }
        });
      }
    );
  } catch (err) {
    console.error("Unexpected error in editMerch:", err);
    return res.status(500).json({
      message: "Server error updating merch.",
      error: err.message,
    });
  }
};

// DELETE /api/admin/merch/:merchId
module.exports.deleteMerch = (req, res) => {
  const merchId = req.params.merchId;

  if (!merchId || isNaN(Number(merchId))) {
    return res
      .status(400)
      .json({ message: "Valid merchId param is required." });
  }

  adminModel.archiveMerch(merchId, (err, result) => {
    if (err) {
      console.error("Error archiving merch:", err);
      return res.status(500).json(err);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Merch not found." });
    }

    return res.status(200).json({
      message: "Merch archived successfully",
      merch: result.rows[0],
    });
  });
};

// PATCH /api/admin/merch/:merchId/restore
// Set isActive back to true (unarchive)
module.exports.unarchiveMerch = (req, res) => {
  const merchId = req.params.merchId;

  if (!merchId || isNaN(Number(merchId))) {
    return res
      .status(400)
      .json({ message: "Valid merchId param is required." });
  }

  adminModel.unarchiveMerch(merchId, (err, result) => {
    if (err) {
      console.error("Error unarchiving merch:", err);
      return res.status(500).json(err);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Merch not found." });
    }

    return res.status(200).json({
      message: "Merch unarchived successfully",
      merch: result.rows[0],
    });
  });
};

