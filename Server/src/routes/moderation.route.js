const router = require('express').Router();
const ModerationController = require('../controllers/moderation.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');

// Apply Auth & Role Check (ADMIN or MODERATOR)
// Lưu ý: roleMiddleware trong project này có thể chỉ nhận 1 role hoặc array.
// Nếu theo convention cũ: roleMiddleware([ROLES.ADMIN, ROLES.MODERATOR])
// Do code cũ dùng roleMiddleware([ROLES.ADMIN]) -> Array support.
const allowedRoles = [ROLES.ADMIN, ROLES.MODERATOR];

router.get('/stats', authMiddleware, roleMiddleware(allowedRoles), ModerationController.getStats);
router.get('/posts', authMiddleware, roleMiddleware(allowedRoles), ModerationController.getPendingPosts);
router.patch('/posts/:postId', authMiddleware, roleMiddleware(allowedRoles), ModerationController.moderatePost);

module.exports = router;
