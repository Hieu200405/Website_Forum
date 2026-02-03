const router = require('express').Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');

const { authLimiter } = require('../middlewares/rateLimit.middleware');

router.post('/register', authLimiter, AuthController.register);

router.post('/login', [
  authLimiter,
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu bắt buộc'),
  validate
], AuthController.login);

module.exports = router;
