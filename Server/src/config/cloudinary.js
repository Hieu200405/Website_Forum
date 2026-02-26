const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
// In a real env, you'd use process.env.CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, etc.
// For now, we fallback to environment variables if available
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
