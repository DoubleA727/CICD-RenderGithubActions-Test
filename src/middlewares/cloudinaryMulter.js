// src/middlewares/cloudinaryMulter.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../services/image-upload/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sp-merch",              // folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

module.exports = upload;
