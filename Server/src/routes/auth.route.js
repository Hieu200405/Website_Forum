const router = require('express').Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');

router.post('/register', AuthController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu bắt buộc'),
  validate
], AuthController.login);

module.exports = router;
