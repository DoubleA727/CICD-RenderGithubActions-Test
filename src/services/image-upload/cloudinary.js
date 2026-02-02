const cloudinary = require('cloudinary').v2;

// This automatically reads CLOUDINARY_URL from env
cloudinary.config({
  secure: true
});

module.exports = cloudinary;
