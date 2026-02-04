const router = require('express').Router();
const PostController = require('../controllers/post.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Routes cho Post
// Yêu cầu đăng nhập để tạo bài viết
router.post('/', authMiddleware, PostController.create);

module.exports = router;
