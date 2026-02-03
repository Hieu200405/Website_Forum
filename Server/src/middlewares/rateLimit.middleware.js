const rateLimit = require('express-rate-limit');

/**
 * Rate Limit Middleware
 * Giới hạn số lượng request từ một IP trong khoảng thời gian nhất định
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Tối đa 100 requests mỗi IP
  standardHeaders: true, // Trả về thông tin rate limit trong headers `RateLimit-*`
  legacyHeaders: false, // Disable headers `X-RateLimit-*`
  message: {
    success: false,
    message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.'
  }
});

// Limit khắt khe hơn cho login/register
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 10, // Tối đa 10 lần thử login/register
  message: {
    success: false,
    message: 'Quá nhiều lần thử đăng nhập/đăng ký, vui lòng thử lại sau 1 giờ.'
  }
});

module.exports = {
  limiter,
  authLimiter
};
