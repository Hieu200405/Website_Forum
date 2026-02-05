const router = require('express').Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const rateLimit = require('../middlewares/rateLimit.middleware');

router.post('/register', rateLimit, AuthController.register);

router.post('/login', [
  rateLimit,
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu bắt buộc'),
  validate
], AuthController.login);

module.exports = router;
