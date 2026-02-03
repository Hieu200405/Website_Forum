const SystemLogRepository = require('../repositories/systemLog.repository');

/**
 * Logging Service - Quản lý ghi nhật ký hệ thống
 */
class LoggingService {
  /**
   * Ghi log hành động
   * @param {number|string} userId - ID của user (null nếu là guest)
   * @param {string} action - Tên hành động (VD: LOGIN, ERROR, VIEW)
   * @param {string} ip - Địa chỉ IP
   * @param {object|string} data - Dữ liệu bổ sung
   * @param {string} level - Mức độ log (INFO, WARN, ERROR)
   */
  static async log(userId, action, ip, data = null, level = 'INFO') {
    try {
      const payload = {
        userId: userId ? parseInt(userId) : null,
        action,
        ip,
        data: data ? (typeof data === 'object' ? JSON.stringify(data) : data) : null,
        level
      };

      // Ghi vào Database (MySQL)
      await SystemLogRepository.create(payload);

    } catch (error) {
      console.error('LoggingService Error:', error);
      // Fallback: ghi console nếu DB lỗi để không mất trace
      console.error('Original Log Data:', { userId, action, ip, data, level });
    }
  }

  /**
   * Lấy danh sách logs
   */
  static async getLogs(limit = 100) {
    return await SystemLogRepository.findAll({ limit });
  }
}

module.exports = LoggingService;
