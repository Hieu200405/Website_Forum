const Like = require('../models/like.model');

class LikeRepository {
  /**
   * Kiểm tra user đã like post chưa
   * @param {number} userId 
   * @param {number} postId 
   * @returns {Promise<boolean>}
   */
  async exists(userId, postId) {
    const like = await Like.findOne({
      where: { user_id: userId, post_id: postId }
    });
    return !!like;
  }

  /**
   * Tạo like mới
   * @param {number} userId 
   * @param {number} postId 
   * @returns {Promise<Like>}
   */
  async create(userId, postId) {
    return await Like.create({ user_id: userId, post_id: postId });
  }

  /**
   * Xóa like
   * @param {number} userId 
   * @param {number} postId 
   * @returns {Promise<boolean>}
   */
  async delete(userId, postId) {
    const deleted = await Like.destroy({
      where: { user_id: userId, post_id: postId }
    });
    return deleted > 0;
  }

  /**
   * Đếm số like của bài viết (Nếu cần count real-time thay vì cache column)
   * @param {number} postId 
   */
  async countByPostId(postId) {
    return await Like.count({ where: { post_id: postId } });
  }
}

module.exports = new LikeRepository();
