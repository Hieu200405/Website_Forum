const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

class LogRepository {
  /**
   * Lấy danh sách log với filter và phân trang
   * @param {object} params 
   */
  async getLogs({ userId, action, from, to, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    
    // Xây dựng điều kiện WHERE
    let whereClauses = ['1 = 1']; // default true for clean appending
    let replacements = {};

    if (userId) {
      whereClauses.push('userId = :userId');
      replacements.userId = userId;
    }
    if (action) {
      whereClauses.push('action LIKE :action');
      replacements.action = `%${action}%`;
    }
    if (from) {
      whereClauses.push('created_at >= :from');
      replacements.from = from;
    }
    if (to) {
      whereClauses.push('created_at <= :to');
      replacements.to = to;
    }

    const whereSql = whereClauses.join(' AND ');

    // 1. Query Data
    // Lưu ý: Tên cột cần khớp DB. Ở các bước trước ta gọi model là SystemLog
    // nhưng yêu cầu ở đây là query thuần.
    // Tên bảng thường là 'system_logs' (từ services/logging.service.js)
    const logs = await sequelize.query(
      `SELECT * FROM system_logs 
       WHERE ${whereSql} 
       ORDER BY created_at DESC 
       LIMIT :limit OFFSET :offset`,
      {
        replacements: { ...replacements, limit, offset },
        type: QueryTypes.SELECT
      }
    );

    // 2. Query Total Count (for pagination)
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM system_logs WHERE ${whereSql}`,
      {
        replacements: { ...replacements },
        type: QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    return {
      rows: logs,
      count: total
    };
  }
}

module.exports = new LogRepository();
