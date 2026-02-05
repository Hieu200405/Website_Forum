const BanUserUseCase = require('../usecases/banUser.usecase');
const UnbanUserUseCase = require('../usecases/unbanUser.usecase');

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
}

module.exports = AdminController;
