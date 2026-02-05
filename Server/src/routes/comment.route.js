const router = require('express').Router();
const CommentController = require('../controllers/comment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public: Xem comments
router.get('/post/:postId', CommentController.getByPost);

// Auth required: Tạo element
router.post('/', authMiddleware, CommentController.create);

// Auth required: Reply Comment
router.post('/reply', authMiddleware, CommentController.reply);

module.exports = router;
