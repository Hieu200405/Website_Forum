const router = require('express').Router();
const AdminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');

// Apply auth middleware for all admin routes
router.use(authMiddleware);

// Route: Change User Role
// Method: PUT /api/admin/users/:id/role
// Permission: ADMIN only
router.put(
  '/users/:id/role',
  roleMiddleware([ROLES.ADMIN]),
  AdminController.changeUserRole
);

module.exports = router;
