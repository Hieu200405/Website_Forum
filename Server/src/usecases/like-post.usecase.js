const LikeRepository = require('../repositories/like.repository');
const PostRepository = require('../repositories/post.repository');
const LoggingService = require('../services/logging.service');

class LikePostUseCase {
  /**
   * Like bài viết
   * @param {number} userId 
   * @param {number} postId 
   * @param {string} ipAddress 
   */
  static async execute(userId, postId, ipAddress) {
    // 1. Kiểm tra Post tồn tại
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw { status: 404, message: 'Bài viết không tồn tại' };
    }
    
    // 2. Kiểm tra trạng thái bài viết (Không cho like bài ẩn/chờ duyệt)
    if (post.status !== 'active') {
      throw { status: 400, message: 'Bài viết không khả dụng' };
    }

    // 3. Kiểm tra đã like chưa
    const hasLiked = await LikeRepository.exists(userId, postId);
    if (hasLiked) {
      throw { status: 409, message: 'Bạn đã like bài viết này rồi' };
    }

    // 4. Create Like
    await LikeRepository.create(userId, postId);

    // 5. Update Post stats
    await PostRepository.increaseLikeCount(postId);

    // 6. Log
    await LoggingService.log(userId, 'LIKE_POST', ipAddress, { postId });

    return { message: 'Đã like bài viết' };
  }
}

module.exports = LikePostUseCase;
