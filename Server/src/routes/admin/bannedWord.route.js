const router = require('express').Router();
const BannedWordController = require('../../controllers/admin/bannedWord.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const ROLES = require('../../constants/roles');

// Apply Auth & Admin Role Check cho toàn bộ route này
router.use(authMiddleware, roleMiddleware([ROLES.ADMIN]));

router.get('/', BannedWordController.getAll);
router.post('/', BannedWordController.add);
router.delete('/:id', BannedWordController.delete);

module.exports = router;
