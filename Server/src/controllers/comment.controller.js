const CreateCommentUseCase = require('../usecases/createComment.usecase');
const GetCommentsByPostUseCase = require('../usecases/getCommentsByPost.usecase');
const ReplyCommentUseCase = require('../usecases/replyComment.usecase');
const CommentLike = require('../models/commentLike.model');
const Comment = require('../models/comment.model');

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
      }, ip, req.app);

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
      
      const result = await ReplyCommentUseCase.execute(userId, req.body, ip, req.app);
      
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
      
      const result = await CreateCommentUseCase.execute(userId, req.body, ip, req.app);
      
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

  /**
   * POST /api/comments/:id/like
   * Thích hoặc toggle like bình luận
   */
  static async likeComment(req, res) {
    try {
      const userId = req.user.userId;
      const commentId = parseInt(req.params.id);

      const comment = await Comment.findByPk(commentId);
      if (!comment) return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });

      const [, created] = await CommentLike.findOrCreate({
        where: { user_id: userId, comment_id: commentId },
      });

      const likeCount = await CommentLike.count({ where: { comment_id: commentId } });

      res.json({
        success: true,
        liked: true,
        likeCount,
        message: created ? 'Đã thích bình luận' : 'Bạn đã thích bình luận này rồi',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/comments/:id/like
   * Bỏ thích bình luận
   */
  static async unlikeComment(req, res) {
    try {
      const userId = req.user.userId;
      const commentId = parseInt(req.params.id);

      await CommentLike.destroy({ where: { user_id: userId, comment_id: commentId } });
      const likeCount = await CommentLike.count({ where: { comment_id: commentId } });

      res.json({ success: true, liked: false, likeCount, message: 'Đã bỏ thích' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /api/comments/:id
   * Xóa bình luận (chỉ tác giả hoặc admin)
   */
  static async deleteComment(req, res) {
    try {
      const userId = req.user.userId;
      const role   = req.user.role;
      const commentId = parseInt(req.params.id);

      const comment = await Comment.findByPk(commentId);
      if (!comment) return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' });

      if (comment.user_id !== userId && !['admin', 'moderator'].includes(role)) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bình luận này' });
      }

      await comment.destroy();
      res.json({ success: true, message: 'Đã xóa bình luận' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = CommentController;
