const CommentRepository = require('../repositories/comment.repository');

class GetCommentsByPostUseCase {
  /**
   * Lấy danh sách bình luận dạng cây (Threaded Comments)
   * @param {number} postId 
   */
  static async execute(postId) {
    // 1. Lấy toàn bộ comments active (Flat list)
    const comments = await CommentRepository.findAllByPostId(postId);

    // 2. Build Tree Structure
    const commentMap = {};
    const roots = [];

    // Chuyển đổi sang DTO và map theo ID
    comments.forEach(c => {
      commentMap[c.id] = {
        id: c.id,
        content: c.content,
        createdAt: c.created_at,
        parentId: c.parent_id,
        author: {
          id: c.author.id,
          username: c.author.username,
          role: c.author.role
        },
        replies: []
      };
    });

    // Ráp cây
    comments.forEach(c => {
      if (c.parent_id && commentMap[c.parent_id]) {
        // Nếu có parent và parent tồn tại -> push vào replies của parent
        commentMap[c.parent_id].replies.push(commentMap[c.id]);
      } else {
        // Nếu không có parent (hoặc parent bị ẩn/xóa) -> là root
        roots.push(commentMap[c.id]);
      }
    });

    return roots;
  }
}

module.exports = GetCommentsByPostUseCase;
