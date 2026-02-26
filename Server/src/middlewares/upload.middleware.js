const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Generate standard filename or let Cloudinary handle randomly
    return {
      folder: 'forum_uploads',
      format: 'jpg', // forces jpeg (can be changed or dynamically detect)
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
      // transformation: [{ width: 1000, crop: "limit" }] // optional resize
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;
