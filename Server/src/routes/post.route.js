const router = require('express').Router();
const PostController = require('../controllers/post.controller');
const CommentController = require('../controllers/comment.controller');
const LikeController = require('../controllers/like.controller');
const ReportController = require('../controllers/report.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rateLimit = require('../middlewares/rateLimit.middleware');

// Middleware optional auth
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

// Auth required: Get saved posts (must be before /:id)
router.get('/saved', authMiddleware, PostController.getSaved);

// Auth required: Create Post (with Rate Limit)
router.post('/', authMiddleware, rateLimit, PostController.create);

// Auth required: Update Post - MUST be here before sub-routes like /:postId/like
router.put('/:id', authMiddleware, PostController.update);

// Auth required: Delete Post - MUST be here before /:postId/like etc.
router.delete('/:id', authMiddleware, PostController.delete);

// Public: Get post detail
router.get('/:id', optionalAuth, PostController.getPostDetail);

// Public: Get comments for a post
router.get('/:postId/comments', CommentController.getByPost);

// Auth required: Comment on Post
router.post('/:postId/comments', authMiddleware, rateLimit, CommentController.commentOnPost);

// Auth required: Like / Unlike
router.post('/:postId/like', authMiddleware, LikeController.like);
router.delete('/:postId/like', authMiddleware, LikeController.unlike);

// Auth required: Save / Unsave
router.post('/:postId/save', authMiddleware, PostController.save);
router.delete('/:postId/save', authMiddleware, PostController.unsave);

// Auth required: Report
router.post('/:postId/report', authMiddleware, ReportController.report);

module.exports = router;
