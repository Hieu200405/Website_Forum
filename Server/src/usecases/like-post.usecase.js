const LikeRepository = require('../repositories/like.repository');
const PostRepository = require('../repositories/post.repository');
const UserRepository = require('../repositories/user.repository');
const LoggingService = require('../services/logging.service');
const NotificationService = require('../services/notification.service');
const RedisService = require('../services/redis.service');

class LikePostUseCase {
  /**
   * Like bài viết
   * @param {number} userId 
   * @param {number} postId 
   * @param {string} ipAddress 
   */
  static async execute(userId, postId, ipAddress, app) {
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
      return { message: 'Đã like bài viết' };
    }

    // 4. Create Like
    await LikeRepository.create(userId, postId);

    // 5. Update Post stats
    await PostRepository.increaseLikeCount(postId);

    // 6. Tích lũy điểm uy tín (Reputation Gamification)
    if (post.user_id && post.user_id !== userId) {
      // Nhận 5 điểm uy tín cho mỗi lượt thích
      await UserRepository.updateReputation(post.user_id, 5);
    }

    // 7. Clear Redis caches (Force refresh for feed and detail)
    await RedisService.delPattern('posts:feed:*');
    await RedisService.delPattern(`posts:detail:${postId}:*`);
    
    // 8. Log
    await LoggingService.log(userId, 'LIKE_POST', ipAddress, { postId });

    // 8. Gửi thông báo
    if (app && post.user_id) {
       await NotificationService.createNotification(app, {
         user_id: post.user_id,
         sender_id: userId,
         type: 'LIKE',
         reference_id: postId,
         content: 'đã thích bài viết của bạn'
       });
    }

    // 9. Fetch updated count for Source of Truth
    const updatedPost = await PostRepository.findById(postId);

    return { 
      message: 'Đã like bài viết', 
      likeCount: updatedPost.like_count || 0,
      isLiked: true
    };
  }
}

module.exports = LikePostUseCase;
