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
    let whereClauses = ["u.role = 'admin'"]; // Filter specifically for admin activities
    let replacements = {};

    if (userId) {
      whereClauses.push('sl.user_id = :userId'); // Using column name according to model
      replacements.userId = userId;
    }
    if (action) {
      whereClauses.push('sl.action LIKE :action');
      replacements.action = `%${action}%`;
    }
    if (from) {
      whereClauses.push('sl.created_at >= :from');
      replacements.from = from;
    }
    if (to) {
      whereClauses.push('sl.created_at <= :to');
      replacements.to = to;
    }

    const whereSql = whereClauses.join(' AND ');

    // 1. Query Data with User Join
    const logs = await sequelize.query(
      `SELECT sl.*, 
              JSON_OBJECT('username', u.username, 'role', u.role) as user 
       FROM system_logs sl
       INNER JOIN users u ON sl.user_id = u.id
       WHERE ${whereSql} 
       ORDER BY sl.created_at DESC 
       LIMIT :limit OFFSET :offset`,
      {
        replacements: { ...replacements, limit, offset },
        type: QueryTypes.SELECT
      }
    );

    // Xử lý lại trường user JS Object từ chuỗi JSON MySQL trả về
    const formattedLogs = logs.map(log => ({
      ...log,
      user: typeof log.user === 'string' ? JSON.parse(log.user) : log.user
    }));

    // 2. Query Total Count
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total 
       FROM system_logs sl
       INNER JOIN users u ON sl.user_id = u.id 
       WHERE ${whereSql}`,
      {
        replacements: { ...replacements },
        type: QueryTypes.SELECT
      }
    );
    const total = countResult[0].total;

    return {
      rows: formattedLogs,
      count: total
    };
  }
}

module.exports = new LogRepository();
