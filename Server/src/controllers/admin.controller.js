const BanUserUseCase = require('../usecases/banUser.usecase');
const UnbanUserUseCase = require('../usecases/unbanUser.usecase');
const UserRepository = require('../repositories/user.repository');
const ReportRepository = require('../repositories/report.repository');

class AdminController {
  
  static async banUser(req, res) {
    try {
      const adminId = req.user.userId;
      const { id } = req.params; // target user id
      const { reason } = req.body;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

      const result = await BanUserUseCase.execute(adminId, id, reason, ip);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  static async unbanUser(req, res) {
    try {
      const adminId = req.user.userId;
      const { id } = req.params; // target user id
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

      const result = await UnbanUserUseCase.execute(adminId, id, ip);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  static async getUsers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows } = await UserRepository.findAll({ limit, offset });

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getReports(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const status = req.query.status || 'pending';

        const { count, rows } = await ReportRepository.findAll({ limit, offset, status });

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getStats(req, res) {
    try {
        const GetAdminStatsUseCase = require('../usecases/getAdminStats.usecase');
        const stats = await GetAdminStatsUseCase.execute();
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = AdminController;
