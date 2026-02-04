const router = require('express').Router();
const PostController = require('../controllers/post.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Middleware optional auth: Thử decode token, nếu lỗi hoặc không có thì next() với guest
// Tạm thời dùng custom middleware nhỏ tại đây hoặc tách file
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Gọi authMiddleware logic nhưng bắt lỗi để không return 401
    // Để đơn giản tôi sẽ dùng trực tiếp authMiddleware nếu cần bảo vệ chặt, 
    // còn đây là public route. Tôi sẽ để controller tự check req.user nếu có middleware chạy trước.
    // Cách tốt nhất là dùng authMiddleware cho route cần login. Route này public.
    // Tuy nhiên UseCase cần biết user để check quyền xem bài hidden.
    // Nên ta cần middleware: "ExtractUserIfPresent"
    try {
       const token = authHeader.split(' ')[1];
       const jwt = require('jsonwebtoken'); // Lazy load
       const config = require('../config/jwt');
       const decoded = jwt.verify(token, config.secret);
       req.user = decoded;
    } catch (e) { /* Ignore invalid token for guest view */ }
  }
  next();
};

// Public: Get all posts
router.get('/', PostController.getList);

// Public (with optional auth for viewing hidden posts): Get Detail
router.get('/:id', optionalAuth, PostController.getDetail);

// Routes cho Post
// Yêu cầu đăng nhập để tạo bài viết
router.post('/', authMiddleware, PostController.create);

module.exports = router;
