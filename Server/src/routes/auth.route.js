const router = require('express').Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const rateLimit = require('../middlewares/rateLimit.middleware');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng ký tài khoản mới
 *     description: Tạo tài khoản người dùng mới. Mật khẩu được mã hóa bằng bcrypt.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *                 minLength: 3
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecret123
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: ✅ Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Đăng ký thành công }
 *                 token:   { type: string, example: eyJhbGciOiJIUzI1NiJ9... }
 *                 user:    { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Email hoặc username đã tồn tại
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 */
router.post('/register', rateLimit, AuthController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập
 *     description: Xác thực email/password và trả về JWT token. Token có hiệu lực **7 ngày**.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MySecret123
 *     responses:
 *       200:
 *         description: ✅ Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 token:   { type: string,  example: eyJhbGciOiJIUzI1NiJ9... }
 *                 user:    { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Sai email hoặc mật khẩu
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       403:
 *         description: Tài khoản bị khóa
 *       429:
 *         $ref: '#/components/responses/RateLimit'
 */
router.post('/login', [
  rateLimit,
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu bắt buộc'),
  validate
], AuthController.login);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập bằng Google OAuth 2.0
 *     description: Xác thực Google ID Token và tạo/tìm tài khoản tương ứng.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID Token từ Google Sign-In
 *                 example: eyJhbGciOiJSUzI1NiIsImtpZCI6...
 *     responses:
 *       200:
 *         description: ✅ Đăng nhập Google thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 token:   { type: string }
 *                 user:    { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Google token không hợp lệ
 */
router.post('/google', rateLimit, AuthController.googleLogin);

module.exports = router;
