const router = require('express').Router();
const AdminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');

// Apply Auth & Admin Role Check cho toàn bộ route (except reports)
router.use(authMiddleware);

// User Management Routes (Admin only)
router.get('/users', roleMiddleware([ROLES.ADMIN]), AdminController.getUsers);
router.patch('/users/:id/ban', roleMiddleware([ROLES.ADMIN]), AdminController.banUser);
router.patch('/users/:id/unban', roleMiddleware([ROLES.ADMIN]), AdminController.unbanUser);

// Report Management (Admin and Moderator can access)
router.get('/reports', roleMiddleware([ROLES.ADMIN, ROLES.MODERATOR]), AdminController.getReports);

// Dashboard stats
router.get('/stats', roleMiddleware([ROLES.ADMIN]), AdminController.getStats);

// System Logs Route (Admin only)
const LogController = require('../controllers/log.controller');
router.get('/logs', roleMiddleware([ROLES.ADMIN]), LogController.getLogs);

// (Note: route banned-words nằm riêng hoặc có thể merge vào file này tùy prefer,
// hiện tại đang tách riêng ở bannedWord.route.js và mount vào /api/admin/banned-words)
// File này sẽ chịu trách nhiệm cho các API chung của Admin được mount vào /api/admin

module.exports = router;
