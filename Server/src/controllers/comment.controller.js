const CreateCommentUseCase = require('../usecases/createComment.usecase');
const GetCommentsByPostUseCase = require('../usecases/getCommentsByPost.usecase');
const ReplyCommentUseCase = require('../usecases/replyComment.usecase');

class CommentController {
  
  /**
   * POST /api/posts/:postId/comments
   * Endpoint: Bình luận vào bài viết (Root comment)
   */
  static async commentOnPost(req, res) {
    try {
      const userId = req.user.userId;
      const { postId } = req.params;
      const { content } = req.body;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

      // Hợp nhất logic: Gọi chung CreateCommentUseCase với parentId = null
      const result = await CreateCommentUseCase.execute(userId, { 
        postId, 
        content, 
        parentId: null 
      }, ip);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error processing comment'
      });
    }
  }

  /**
   * POST /api/comments/reply
   * Endpoint: Trả lời bình luận
   */
  static async reply(req, res) {
    try {
      const userId = req.user.userId;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      
      const result = await ReplyCommentUseCase.execute(userId, req.body, ip);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error creating reply'
      });
    }
  }

  /**
   * POST /api/comments
   * Tạo bình luận (Generic - hỗ trợ cả reply)
   */
  static async create(req, res) {
    try {
      const userId = req.user.userId;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      
      const result = await CreateCommentUseCase.execute(userId, req.body, ip);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error creating comment'
      });
    }
  }

  /**
   * GET /api/comments/post/:postId
   * Lấy danh sách bình luận theo Post
   */
  static async getByPost(req, res) {
    try {
      const { postId } = req.params;
      const result = await GetCommentsByPostUseCase.execute(postId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error fetching comments'
      });
    }
  }
}

module.exports = CommentController;
