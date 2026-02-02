// routes/adminRoute.js
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const upload = require("../middlewares/cloudinaryMulter");
const adminController = require("../controllers/adminController");
const emailController = require("../controllers/emailController")

// merch routes with image upload
router.post("/merch", 
  upload.single("imageFile"), 
  adminController.createMerch);

router.put("/merch/:merchId", 
  upload.single("imageFile"), 
  adminController.editMerch);

router.delete("/merch/:merchId", adminController.deleteMerch);

// Unarchive merch (set isActive back to true)
router.patch("/merch/:merchId/restore", adminController.unarchiveMerch);

// emailer
router.post("/promoEmail",
  emailController.sendPromotionalEmail
)

module.exports = router;
