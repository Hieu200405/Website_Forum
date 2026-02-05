const LikePostUseCase = require('../usecases/like-post.usecase');
const UnlikePostUseCase = require('../usecases/unlike-post.usecase');

class LikeController {
  
  /**
   * POST /api/posts/:postId/like
   */
  static async like(req, res) {
    try {
      const userId = req.user.userId;
      const { postId } = req.params;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

      const result = await LikePostUseCase.execute(userId, postId, ip);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/posts/:postId/like
   */
  static async unlike(req, res) {
    try {
      const userId = req.user.userId;
      const { postId } = req.params;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

      const result = await UnlikePostUseCase.execute(userId, postId, ip);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }
}

module.exports = LikeController;
