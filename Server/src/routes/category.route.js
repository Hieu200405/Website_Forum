const router = require('express').Router();
const CategoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const ROLES = require('../constants/roles');

// Public: Get all categories
router.get('/', CategoryController.getAll);

// Admin only: Create, Update, Delete
router.post(
  '/',
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  CategoryController.create
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  CategoryController.update
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([ROLES.ADMIN]),
  CategoryController.delete
);

module.exports = router;
