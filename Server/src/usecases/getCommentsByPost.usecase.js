const CommentRepository = require('../repositories/comment.repository');

class GetCommentsByPostUseCase {
  /**
   * Lấy danh sách bình luận dạng cây (Threaded Comments)
   * @param {number} postId 
   */
  static async execute(postId) {
    // 1. Lấy toàn bộ comments active (Flat list)
    const comments = await CommentRepository.findAllByPostId(postId);

    // 2. Convert to DTO (Flat list)
    const result = comments.map(c => ({
      id: c.id,
      content: c.content,
      createdAt: c.created_at,
      parent_id: c.parent_id,
      author: c.author ? {
        id: c.author.id,
        username: c.author.username,
        role: c.author.role
      } : {
        id: null,
        username: 'Người dùng ẩn danh',
        role: 'user'
      }
    }));

    return result;
  }
}

module.exports = GetCommentsByPostUseCase;
