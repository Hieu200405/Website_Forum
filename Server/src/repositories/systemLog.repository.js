const { Op } = require('sequelize');
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

  async countModerationActionsToday() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const actions = ['APPROVE_POST', 'HIDE_POST', 'DELETE_POST'];

    const count = await SystemLog.count({
        where: {
            action: { [Op.in]: actions },
            created_at: { [Op.gte]: startOfDay }
        }
    });

    return count;
  }
}

module.exports = new SystemLogRepository();
