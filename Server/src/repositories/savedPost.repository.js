const SavedPost = require('../models/savedPost.model');

class SavedPostRepository {
  async exists(userId, postId) {
    const savedPost = await SavedPost.findOne({
      where: { user_id: userId, post_id: postId }
    });
    return !!savedPost;
  }

  async create(userId, postId) {
    return await SavedPost.create({ user_id: userId, post_id: postId });
  }

  async delete(userId, postId) {
    return await SavedPost.destroy({
      where: { user_id: userId, post_id: postId }
    });
  }

  // Phương thức đếm nếu cần
}

module.exports = new SavedPostRepository();
