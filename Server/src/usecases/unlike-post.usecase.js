const LikeRepository = require('../repositories/like.repository');
const PostRepository = require('../repositories/post.repository');
const UserRepository = require('../repositories/user.repository');
const LoggingService = require('../services/logging.service');
const RedisService = require('../services/redis.service');

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
      return { message: 'Đã bỏ like bài viết' };
    }

    // 3. Delete Like
    await LikeRepository.delete(userId, postId);

    // 4. Update Post stats
    await PostRepository.decreaseLikeCount(postId);

    // 5. Trừ điểm uy tín (Reputation Gamification)
    if (post.user_id && post.user_id !== userId) {
      await UserRepository.updateReputation(post.user_id, -5);
    }

    // 6. Clear Redis caches (Force refresh for feed and detail)
    await RedisService.delPattern('posts:feed:*');
    await RedisService.delPattern(`posts:detail:${postId}:*`);

    // 7. Log
    await LoggingService.log(userId, 'UNLIKE_POST', ipAddress, { postId });

    // 7. Get Source of Truth
    const updatedPost = await PostRepository.findById(postId);

    return { 
      message: 'Đã bỏ like bài viết', 
      likeCount: updatedPost ? updatedPost.like_count : 0,
      isLiked: false
    };
  }
}

module.exports = UnlikePostUseCase;
