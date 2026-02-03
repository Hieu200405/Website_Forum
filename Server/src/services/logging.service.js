const redisClient = require('../config/redis');

/**
 * Logging Service - Ghi log các hành động của user vào Redis
 */
class LoggingService {
  /**
   * Ghi log hành động của user
   * @param {string} action - Tên hành động (VD: REGISTER, LOGIN, CREATE_POST)
   * @param {object} data - Dữ liệu liên quan đến hành động
   * @returns {Promise<void>}
   */

  /**
   * Ghi log hành động cụ thể của user (Login, Logout, v.v.)
   * @param {number|string} userId - ID của user
   * @param {string} action - Tên hành động (VD: LOGIN)
   * @param {string} ip - Địa chỉ IP thực hiện hành động
   * @returns {Promise<void>}
   */
  static async log(userId, action, ip) {
    try {
      const logEntry = {
        userId,
        action,
        ip,
        timestamp: new Date().toISOString(),
      };

      // Key pattern: log:{action}:{timestamp}
      const key = `log:${action}:${Date.now()}`;
      
      // Lưu vào Redis
      await redisClient.set(key, JSON.stringify(logEntry));
      
      // Expire sau 30 ngày
      await redisClient.expire(key, 2592000);

      console.log(`[LOG - ${action}] User: ${userId} - IP: ${ip}`);
    } catch (error) {
      console.error('LoggingService Error:', error);
      // Không throw lỗi để tránh ảnh hưởng luồng chính
    }
  }

  // Giữ lại method cũ (đổi tên hoặc deprecate nếu cần, nhưng để tương thích tôi sẽ overload logic ở trên nếu tham số khớp, 
  // tuy nhiên Javascript không overload như Java. Tôi sẽ tạo logLogin riêng hoặc sửa method log để check type).
  // Vì yêu cầu ghi đè: "LoggingService chỉ có hàm log(userId, action, ip)", tôi sẽ thay thế hàm log cũ hoặc điều chỉnh nó.
  
  /**
   * (Cũ) Ghi log chung
   * @deprecated Dùng log(userId, action, ip) cho các hành động user
   */
  static async logGeneral(action, data) {
     // ... logic cũ ...
     try {
      const key = `log:GENERAL:${action}:${Date.now()}`;
      await redisClient.set(key, JSON.stringify({ action, data, timestamp: new Date() }));
      await redisClient.expire(key, 2592000);
     } catch(e) { console.error(e); }
  }

  /**
   * Lấy logs theo action
   * @param {string} action - Tên hành động
   * @param {number} limit - Số lượng logs cần lấy
   * @returns {Promise<Array>}
   */
  static async getLogs(action, limit = 100) {
    try {
      const pattern = `log:${action}:*`;
      const keys = await redisClient.keys(pattern);
      
      const logs = [];
      for (const key of keys.slice(0, limit)) {
        const logData = await redisClient.get(key);
        if (logData) {
          logs.push(JSON.parse(logData));
        }
      }
      
      return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Get logs error:', error);
      return [];
    }
  }
}

module.exports = LoggingService;
