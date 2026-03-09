const LikePostUseCase = require('../usecases/like-post.usecase');
const UnlikePostUseCase = require('../usecases/unlike-post.usecase');

class LikeController {
  
  /**
   * POST /api/posts/:postId/like
   */
  static async like(req, res) {
    console.log(`[LIKE] User ${req.user?.userId} liking post ${req.params.postId}`);
    try {
      const userId = req.user.userId;
      const { postId } = req.params;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

      const result = await LikePostUseCase.execute(userId, postId, ip, req.app);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error(`[LIKE ERROR] User ${req.user?.userId} post ${req.params.postId}:`, error);
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/posts/:postId/like
   */
  static async unlike(req, res) {
    console.log(`[UNLIKE] User ${req.user?.userId} unliking post ${req.params.postId}`);
    try {
      const userId = req.user.userId;
      const { postId } = req.params;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

      const result = await UnlikePostUseCase.execute(userId, postId, ip, req.app);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error(`[UNLIKE ERROR] User ${req.user?.userId} post ${req.params.postId}:`, error);
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }
}

module.exports = LikeController;
