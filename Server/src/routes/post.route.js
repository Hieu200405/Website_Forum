const router = require('express').Router();
const PostController = require('../controllers/post.controller');
const CommentController = require('../controllers/comment.controller');
const LikeController = require('../controllers/like.controller');
const ReportController = require('../controllers/report.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rateLimit = require('../middlewares/rateLimit.middleware');

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

/**
 * @swagger
 * /posts:
 *   get:
 *     tags: [Posts]
 *     summary: Lấy danh sách bài viết
 */
router.get('/', optionalAuth, PostController.getPosts);

/**
 * @swagger
 * /posts/saved:
 *   get:
 *     tags: [Posts]
 *     summary: Lấy danh sách bài viết đã lưu
 */
router.get('/saved', authMiddleware, PostController.getSaved);

/**
 * @swagger
 * /posts:
 *   post:
 *     tags: [Posts]
 */
router.post('/', authMiddleware, rateLimit, PostController.create);

// ─── Post-related Specific Actions (Placed BEFORE generic :id routes) ───

/**
 * @swagger
 * /posts/{postId}/comments:
 */
router.get('/:postId/comments', CommentController.getByPost);
router.post('/:postId/comments', authMiddleware, rateLimit, CommentController.commentOnPost);

/**
 * @swagger
 * /posts/{postId}/like:
 */
router.post('/:postId/like', authMiddleware, LikeController.like);
router.delete('/:postId/like', authMiddleware, LikeController.unlike);

/**
 * @swagger
 * /posts/{postId}/save:
 */
router.post('/:postId/save', authMiddleware, PostController.save);
router.delete('/:postId/save', authMiddleware, PostController.unsave);

/**
 * @swagger
 * /posts/{postId}/report:
 */
router.post('/:postId/report', authMiddleware, ReportController.report);

// ─── Individual Post Operations ───

router.put('/:id', authMiddleware, PostController.update);
router.delete('/:id', authMiddleware, PostController.delete);
router.get('/:id', optionalAuth, PostController.getPostDetail);

module.exports = router;
