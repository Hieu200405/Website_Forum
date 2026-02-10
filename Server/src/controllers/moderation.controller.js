const ModeratePostUseCase = require('../usecases/moderatePost.usecase');
const GetModerationStatsUseCase = require('../usecases/getModerationStats.usecase');

class ModerationController {
  
  /**
   * PATCH /api/moderation/posts/:postId
   * Duyệt / Ẩn bài viết
   */
  static async moderatePost(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role; // Middleware auth decoded token
      const { postId } = req.params;
      const { action, reason } = req.body;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

      const result = await ModeratePostUseCase.execute(userId, userRole, postId, action, reason, ip);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }
  /**
   * GET /api/moderation/stats
   * Lấy thống kê cho moderator
   */
  static async getStats(req, res) {
    try {
      const result = await GetModerationStatsUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ModerationController;
