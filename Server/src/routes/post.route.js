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
 *     description: Trả về danh sách bài viết có phân trang, hỗ trợ tìm kiếm và lọc theo danh mục. Kết quả được cache Redis 60 giây.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 50 }
 *         description: Số bài mỗi trang
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Từ khóa tìm kiếm (full-text search)
 *         example: React hooks
 *       - in: query
 *         name: category_id
 *         schema: { type: integer }
 *         description: Lọc theo danh mục
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [latest, popular, trending] }
 *         description: Sắp xếp bài viết
 *     responses:
 *       200:
 *         description: ✅ Danh sách bài viết
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Post' }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:       { type: integer, example: 1 }
 *                     limit:      { type: integer, example: 10 }
 *                     total:      { type: integer, example: 150 }
 *                     totalPages: { type: integer, example: 15 }
 */
router.get('/', optionalAuth, PostController.getPosts);

/**
 * @swagger
 * /posts/saved:
 *   get:
 *     tags: [Posts]
 *     summary: Lấy danh sách bài viết đã lưu
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Danh sách bài đã lưu
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/saved', authMiddleware, PostController.getSaved);

/**
 * @swagger
 * /posts:
 *   post:
 *     tags: [Posts]
 *     summary: Tạo bài viết mới
 *     description: |
 *       Tạo bài viết mới. Nội dung sẽ được **kiểm duyệt bởi AI (Gemini)** trước khi đăng.
 *       - Nếu nội dung vi phạm → status `pending`
 *       - Nếu nội dung hợp lệ → status `active`
 *       - Rate limit: **3 bài/phút**
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, category_id]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Hướng dẫn React Hooks cho người mới
 *                 maxLength: 200
 *               content:
 *                 type: string
 *                 example: "<p>React Hooks là...</p>"
 *               category_id:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: ✅ Bài viết được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Post' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 */
router.post('/', authMiddleware, rateLimit, PostController.create);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     tags: [Posts]
 *     summary: Xem chi tiết bài viết
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 42
 *     responses:
 *       200:
 *         description: ✅ Chi tiết bài viết
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:    { $ref: '#/components/schemas/Post' }
 *                 isLiked: { type: boolean, example: false }
 *                 isSaved: { type: boolean, example: true }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags: [Posts]
 *     summary: Cập nhật bài viết
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:       { type: string }
 *               content:     { type: string }
 *               category_id: { type: integer }
 *     responses:
 *       200:
 *         description: ✅ Cập nhật thành công
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   delete:
 *     tags: [Posts]
 *     summary: Xóa bài viết
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: ✅ Xóa thành công
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/:id', authMiddleware, PostController.update);
router.delete('/:id', authMiddleware, PostController.delete);
router.get('/:id', optionalAuth, PostController.getPostDetail);

/**
 * @swagger
 * /posts/{postId}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: Lấy bình luận của bài viết
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: ✅ Danh sách bình luận (kèm replies)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Comment' }
 *   post:
 *     tags: [Comments]
 *     summary: Đăng bình luận
 *     description: Bình luận mới hoặc phản hồi (nested comment). Rate limit **5 bình luận/phút**.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:   { type: string, example: Bài viết rất hữu ích! }
 *               parent_id: { type: integer, nullable: true, example: null, description: ID bình luận cha (nếu là reply) }
 *     responses:
 *       201:
 *         description: ✅ Đăng bình luận thành công
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:postId/comments', CommentController.getByPost);
router.post('/:postId/comments', authMiddleware, rateLimit, CommentController.commentOnPost);

/**
 * @swagger
 * /posts/{postId}/like:
 *   post:
 *     tags: [Posts]
 *     summary: Thích bài viết
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: ✅ Đã thích bài viết
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   delete:
 *     tags: [Posts]
 *     summary: Bỏ thích bài viết
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: ✅ Đã bỏ thích
 */
router.post('/:postId/like', authMiddleware, LikeController.like);
router.delete('/:postId/like', authMiddleware, LikeController.unlike);

/**
 * @swagger
 * /posts/{postId}/save:
 *   post:
 *     tags: [Posts]
 *     summary: Lưu bài viết
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: ✅ Đã lưu bài viết
 *   delete:
 *     tags: [Posts]
 *     summary: Bỏ lưu bài viết
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: ✅ Đã bỏ lưu
 */
router.post('/:postId/save', authMiddleware, PostController.save);
router.delete('/:postId/save', authMiddleware, PostController.unsave);

/**
 * @swagger
 * /posts/{postId}/report:
 *   post:
 *     tags: [Posts]
 *     summary: Báo cáo bài viết vi phạm
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *                 enum: [spam, inappropriate, misinformation, other]
 *                 example: spam
 *     responses:
 *       200:
 *         description: ✅ Đã gửi báo cáo thành công
 */
router.post('/:postId/report', authMiddleware, ReportController.report);

module.exports = router;
