const CreatePostUseCase = require('../usecases/createPost.usecase');

class PostController {
  
  /**
   * API Tạo bài viết
   * POST /api/posts
   */
  static async create(req, res) {
    try {
      const userId = req.user.userId;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      
      const result = await CreatePostUseCase.execute(userId, req.body, ip);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error'
      });
    }
  }
}

module.exports = PostController;
