const router = require('express').Router();
const CommentController = require('../controllers/comment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rateLimit = require('../middlewares/rateLimit.middleware');

/**
 * @swagger
 * /comments/post/{postId}:
 *   get:
 *     tags: [Comments]
 *     summary: Lấy bình luận của bài viết (nested)
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Danh sách bình luận kèm replies
 */
router.get('/post/:postId', CommentController.getByPost);

/**
 * @swagger
 * /comments:
 *   post:
 *     tags: [Comments]
 *     summary: Tạo bình luận mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, post_id]
 *             properties:
 *               content: { type: string }
 *               post_id: { type: integer }
 *     responses:
 *       201:
 *         description: ✅ Bình luận được tạo
 */
router.post('/', authMiddleware, rateLimit, CommentController.create);

/**
 * @swagger
 * /comments/reply:
 *   post:
 *     tags: [Comments]
 *     summary: Phản hồi bình luận
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, post_id, parent_id]
 *             properties:
 *               content:   { type: string }
 *               post_id:   { type: integer }
 *               parent_id: { type: integer }
 *     responses:
 *       201:
 *         description: ✅ Phản hồi được tạo
 */
router.post('/reply', authMiddleware, rateLimit, CommentController.reply);

/**
 * @swagger
 * /comments/{id}/like:
 *   post:
 *     tags: [Comments]
 *     summary: Thích bình luận
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID bình luận
 *     responses:
 *       200:
 *         description: ✅ Đã thích bình luận
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:   { type: boolean, example: true }
 *                 liked:     { type: boolean, example: true }
 *                 likeCount: { type: integer, example: 5 }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   delete:
 *     tags: [Comments]
 *     summary: Bỏ thích bình luận
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: ✅ Đã bỏ thích
 */
router.post('/:id/like',    authMiddleware, CommentController.likeComment);
router.delete('/:id/like',  authMiddleware, CommentController.unlikeComment);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     tags: [Comments]
 *     summary: Xóa bình luận
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
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.delete('/:id', authMiddleware, CommentController.deleteComment);

module.exports = router;
