const SystemLog = require('../models/systemLog.model');

class SystemLogRepository {
  async create(logData) {
    return await SystemLog.create(logData);
  }

  async findAll({ limit = 100, offset = 0, order = [['created_at', 'DESC']] } = {}) {
    return await SystemLog.findAll({
      limit,
      offset,
      order
    });
  }
}

module.exports = new SystemLogRepository();
