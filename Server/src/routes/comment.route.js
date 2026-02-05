const router = require('express').Router();
const CommentController = require('../controllers/comment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rateLimit = require('../middlewares/rateLimit.middleware');

// Public: Xem comments
router.get('/post/:postId', CommentController.getByPost);

// Auth required: Tạo element
router.post('/', authMiddleware, rateLimit, CommentController.create);

// Auth required: Reply Comment
router.post('/reply', authMiddleware, rateLimit, CommentController.reply);

module.exports = router;
