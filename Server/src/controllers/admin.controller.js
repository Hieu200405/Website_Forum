const ChangeRoleUseCase = require('../usecases/changeRole.usecase');

class AdminController {
  /**
   * API: PUT /api/admin/users/:id/role
   * Thay đổi role của user
   */
  static async changeUserRole(req, res) {
    try {
      const adminId = req.user.userId;
      const targetUserId = req.params.id;
      const { role } = req.body;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

      const result = await ChangeRoleUseCase.execute(adminId, targetUserId, role, ip);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('ChangeRole Error:', error);
      const status = error.status || 500;
      const message = error.message || 'Internal Server Error';
      
      return res.status(status).json({
        success: false,
        message
      });
    }
  }
}

module.exports = AdminController;
