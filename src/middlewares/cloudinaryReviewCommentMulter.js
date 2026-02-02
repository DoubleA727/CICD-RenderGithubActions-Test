const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../services/image-upload/cloudinary");

// Multer storage for review comment images
const reviewCommentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "review-comments",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

const uploadReviewCommentImage = multer({ storage: reviewCommentStorage });

module.exports = uploadReviewCommentImage;
