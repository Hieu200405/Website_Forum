const Comment = require('../models/comment.model');

class CommentRepository {
  /**
   * Tạo comment mới
   * @param {object} data
   * @returns {Promise<Model>}
   */
  async create(data) {
    return await Comment.create(data);
  }

  /**
   * Tìm comment theo ID
   * @param {number} id 
   * @returns {Promise<Comment|null>}
   */
  async findById(id) {
    return await Comment.findByPk(id);
  }

  /**
   * Lấy danh sách comment của một bài viết (Flat list)
   * @param {number} postId 
   * @returns {Promise<Comment[]>}
   */
  async findAllByPostId(postId) {
    return await Comment.findAll({
      where: { 
        post_id: postId,
        status: 'active' 
      },
      order: [['created_at', 'ASC']], 
      include: [
        { 
          model: require('../models/user.model'), 
          as: 'author', 
          attributes: ['id', 'username', 'role'] 
        }
      ]
    });
  }
}

module.exports = new CommentRepository();
