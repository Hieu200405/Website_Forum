const ReportPostUseCase = require('../usecases/report-post.usecase');

class ReportController {
  
  static async report(req, res) {
    try {
      const userId = req.user.userId;
      const { postId, reason } = req.body; // Body chứa cả postId
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

      const result = await ReportPostUseCase.execute(userId, postId, reason, ip);
      res.status(201).json({ success: true, message: result.message });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ReportController;
