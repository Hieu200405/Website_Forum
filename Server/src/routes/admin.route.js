const router = require('express').Router();
const AdminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');

// Apply Auth & Admin Role Check cho toàn bộ route
router.use(authMiddleware, roleMiddleware([ROLES.ADMIN]));

// User Management Routes
router.patch('/users/:id/ban', AdminController.banUser);
router.patch('/users/:id/unban', AdminController.unbanUser);

// System Logs Route
const LogController = require('../controllers/log.controller');
router.get('/logs', LogController.getLogs);

// (Note: route banned-words nằm riêng hoặc có thể merge vào file này tùy prefer,
// hiện tại đang tách riêng ở bannedWord.route.js và mount vào /api/admin/banned-words)
// File này sẽ chịu trách nhiệm cho các API chung của Admin được mount vào /api/admin

module.exports = router;
