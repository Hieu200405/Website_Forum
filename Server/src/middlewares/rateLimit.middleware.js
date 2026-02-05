const RedisService = require('../services/redis.service');

/**
 * Cấu hình giới hạn request (requests per 60s)
 */
const LIMITS = {
  LOGIN: 5,
  REGISTER: 5,
  POST: 10,
  COMMENT: 20,
  DEFAULT: 60
};

const rateLimit = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    let identifier = ip; // Default to IP
    let type = 'default';
    let limit = LIMITS.DEFAULT;
    
    // 1. Xác định Type & Limit & Identifier
    const path = req.originalUrl || req.path;
    const method = req.method;

    if (method === 'POST') {
      if (path.includes('/api/auth/login')) {
        type = 'login';
        limit = LIMITS.LOGIN;
      } else if (path.includes('/api/auth/register')) {
        type = 'register';
        limit = LIMITS.REGISTER;
      } else if (path.includes('/api/posts')) {
        type = 'post';
        limit = LIMITS.POST;
        // Nếu API POST Post/Comment yêu cầu Auth, ta ưu tiên dùng UserId nếu có
        if (req.user && req.user.userId) {
            identifier = `user_${req.user.userId}`;
        }
      } else if (path.includes('/api/comments')) {
        type = 'comment';
        limit = LIMITS.COMMENT;
        if (req.user && req.user.userId) {
            identifier = `user_${req.user.userId}`;
        }
      }
    }

    // 2. Tạo Redis Key
    const key = `rate:${type}:${identifier}`;

    // 3. Increment & Check
    // Lưu ý: Nếu RedisService không expose raw client INCR, ta dùng get/set (có race condition nhỏ)
    // Nhưng RedisService của ta hiện tại chỉ có get/set. 
    // Ta cần mở rộng RedisService để hỗ trợ incr hoặc dùng raw client.
    // Để giữ code clean, tôi sẽ dùng logic get/set đơn giản ở đây hoặc gọi method mới nếu có.
    // Tốt nhất là thêm method incr vào RedisService, nhưng tôi không muốn sửa file đó nếu không cần thiết.
    // Tôi sẽ dùng trực tiếp redis client từ require('redis')? Không, nên dùng qua service.
    // GIẢ ĐỊNH RedisService có thêm method `incr(key, ttl)` hoặc tôi tự implement logic get/set atomic bằng post/lua nếu cần.
    // Với mức độ "bản nháp", tôi sẽ dùng logic: get -> int -> inc -> set logic.
    
    // TỐT HƠN: Update RedisService để có method rateLimitCheckAtomic nếu muốn chuẩn.
    // Nhưng tôi sẽ viết logic "thêm" vào file middleware này bằng cách truy cập client (nếu public) 
    // hoặc thêm method `incr` vào RedisService ngay bây giờ.
    
    // Tôi sẽ cập nhật RedisService để có hàm incr.
    // Nhưng trước tiên, viết file middleware gọi nó.
    
    const currentValue = await RedisService.increment(key, 60); // 60s TTL
    
    if (currentValue > limit) {
        return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    next();
  } catch (error) {
    console.error('Rate Limit Error:', error);
    // Fail open: Nếu Redis lỗi, cho phép request đi qua để không gián đoạn dịch vụ
    next();
  }
};

module.exports = rateLimit;
