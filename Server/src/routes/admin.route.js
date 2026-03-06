const router = require('express').Router();
const AdminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');

router.use(authMiddleware);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Lấy danh sách tất cả người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Tìm kiếm theo username/email
 *     responses:
 *       200:
 *         description: ✅ Danh sách người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/users', roleMiddleware([ROLES.ADMIN]), AdminController.getUsers);

/**
 * @swagger
 * /admin/users/{id}/ban:
 *   patch:
 *     tags: [Admin]
 *     summary: Khóa tài khoản người dùng
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
 *               reason: { type: string, example: Vi phạm quy định cộng đồng }
 *     responses:
 *       200:
 *         description: ✅ Tài khoản đã bị khóa
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.patch('/users/:id/ban', roleMiddleware([ROLES.ADMIN]), AdminController.banUser);

/**
 * @swagger
 * /admin/users/{id}/unban:
 *   patch:
 *     tags: [Admin]
 *     summary: Mở khóa tài khoản người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: ✅ Tài khoản đã được mở khóa
 */
router.patch('/users/:id/unban', roleMiddleware([ROLES.ADMIN]), AdminController.unbanUser);

/**
 * @swagger
 * /admin/reports:
 *   get:
 *     tags: [Admin]
 *     summary: Danh sách báo cáo vi phạm
 *     description: Xem tất cả báo cáo bài viết từ người dùng. Cả Admin và Moderator đều có quyền truy cập.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Danh sách báo cáo
 */
router.get('/reports', roleMiddleware([ROLES.ADMIN, ROLES.MODERATOR]), AdminController.getReports);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Thống kê tổng quan hệ thống
 *     description: |
 *       Trả về số liệu thống kê đa chiều bao gồm:
 *       - Tổng users, posts, comments, likes
 *       - Biểu đồ tăng trưởng 30 ngày
 *       - Phân bổ bài viết theo chuyên mục
 *       - Hoạt động theo ngày trong tuần
 *       - Top 5 người dùng tích cực nhất
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Số liệu thống kê
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalUsers:    { type: integer, example: 250 }
 *                         totalPosts:    { type: integer, example: 1240 }
 *                         totalComments: { type: integer, example: 4530 }
 *                         totalLikes:    { type: integer, example: 8900 }
 *                         pendingPosts:  { type: integer, example: 12 }
 *                         bannedUsers:   { type: integer, example: 3 }
 *                     charts:
 *                       type: object
 *                       properties:
 *                         usersByDay:       { type: array, items: { type: object } }
 *                         postsByDay:       { type: array, items: { type: object } }
 *                         postsByCategory:  { type: array, items: { type: object } }
 *                         postsByWeekday:   { type: array, items: { type: object } }
 *                     topPosters:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/User' }
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/stats', roleMiddleware([ROLES.ADMIN]), AdminController.getStats);

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     tags: [Admin]
 *     summary: Xem nhật ký hệ thống
 *     description: Lịch sử các hoạt động quan trọng (đăng nhập, cấm user, kiểm duyệt...)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: level
 *         schema: { type: string, enum: [INFO, WARN, ERROR] }
 *     responses:
 *       200:
 *         description: ✅ Danh sách log
 */
const LogController = require('../controllers/log.controller');
router.get('/logs', roleMiddleware([ROLES.ADMIN]), LogController.getLogs);

module.exports = router;
