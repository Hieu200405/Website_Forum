const LikeRepository = require('../repositories/like.repository');
const PostRepository = require('../repositories/post.repository');
const LoggingService = require('../services/logging.service');

class UnlikePostUseCase {
  /**
   * Unlike bài viết
   * @param {number} userId 
   * @param {number} postId 
   * @param {string} ipAddress 
   */
  static async execute(userId, postId, ipAddress) {
    // 1. Kiểm tra Post tồn tại (Optional, nhưng tốt để tránh lỗi logic)
    // Nếu post bị xóa thì like cũng nên mất (Cascade), nhưng nếu còn ở đây check cho chắc.
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw { status: 404, message: 'Bài viết không tồn tại' };
    }

    // 2. Kiểm tra có like để xóa không
    const hasLiked = await LikeRepository.exists(userId, postId);
    if (!hasLiked) {
      throw { status: 404, message: 'Bạn chưa like bài viết này' };
    }

    // 3. Delete Like
    await LikeRepository.delete(userId, postId);

    // 4. Update Post stats
    await PostRepository.decreaseLikeCount(postId);

    // 5. Log
    await LoggingService.log(userId, 'UNLIKE_POST', ipAddress, { postId });

    return { message: 'Đã bỏ like bài viết' };
  }
}

module.exports = UnlikePostUseCase;
