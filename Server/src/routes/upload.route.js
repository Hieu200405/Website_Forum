const router = require('express').Router();
const UploadController = require('../controllers/upload.controller');
const uploadMiddleware = require('../middlewares/upload.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

// Protect route to users only to prevent abuse
// the 'image' matches the name field inside form-data
router.post('/', authMiddleware, uploadMiddleware.single('image'), UploadController.uploadImage);

module.exports = router;
