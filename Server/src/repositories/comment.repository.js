const Comment = require('../models/comment.model');
const User = require('../models/user.model');

class CommentRepository {
  /**
   * Lấy danh sách comment của một bài viết
   * @param {number} postId 
   * @param {number} limit 
   * @returns {Promise<Comment[]>}
   */
  async findByPostId(postId, limit = 50) {
    return await Comment.findAll({
      where: { 
        post_id: postId,
        status: 'active' 
      },
      limit,
      order: [['created_at', 'ASC']], // Cũ nhất trước
      include: [
        { 
          model: User, 
          as: 'author', 
          attributes: ['id', 'username', 'role'] 
        }
      ]
    });
  }
}

module.exports = new CommentRepository();
