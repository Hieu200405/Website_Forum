const router = require('express').Router();
const PostController = require('../controllers/post.controller');
const CommentController = require('../controllers/comment.controller');
const LikeController = require('../controllers/like.controller');
const ReportController = require('../controllers/report.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rateLimit = require('../middlewares/rateLimit.middleware');

// Middleware optional auth: Thử decode token, nếu lỗi hoặc không có thì next() với guest
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
       const token = authHeader.split(' ')[1];
       const jwt = require('jsonwebtoken');
       const config = require('../config/jwt');
       const decoded = jwt.verify(token, config.secret);
       req.user = decoded;
    } catch (e) { /* Ignore invalid token */ }
  }
  next();
};

// Public: Get all posts
router.get('/', optionalAuth, PostController.getPosts);

// Public (with optional auth for viewing hidden posts): Get Detail
router.get('/:id', optionalAuth, PostController.getPostDetail);

// Auth required: Comment on Post
router.post('/:postId/comments', authMiddleware, rateLimit, CommentController.commentOnPost);

// Auth required: Like / Unlike
router.post('/:postId/like', authMiddleware, LikeController.like);
router.delete('/:postId/like', authMiddleware, LikeController.unlike);

// Auth required: Report
router.post('/:postId/report', authMiddleware, ReportController.report);

// Auth required: Create Post (with Rate Limit)
router.post('/', authMiddleware, rateLimit, PostController.create);

module.exports = router;
