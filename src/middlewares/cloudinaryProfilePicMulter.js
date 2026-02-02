const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../services/image-upload/cloudinary");

const profilePicStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile-pics",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "fill" }],
  },
});

const uploadProfilePic = multer({ storage: profilePicStorage });

module.exports = uploadProfilePic;
