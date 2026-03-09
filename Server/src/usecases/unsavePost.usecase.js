const SavedPostRepository = require('../repositories/savedPost.repository');
const LoggingService = require('../services/logging.service');
const RedisService = require('../services/redis.service');

class UnsavePostUseCase {
  static async execute(userId, postId, ipAddress) {
    const isAlreadySaved = await SavedPostRepository.exists(userId, postId);
    if (isAlreadySaved) {
      await SavedPostRepository.delete(userId, postId);
    }

    // Clear Redis cache
    await RedisService.delPattern('posts:feed:*');
    await RedisService.delPattern(`posts:detail:${postId}:*`);

    await LoggingService.log(userId, 'UNSAVE_POST', ipAddress, { postId });

    return { 
      message: 'Đã bỏ lưu bài viết',
      isSaved: false
    };
  }
}

module.exports = UnsavePostUseCase;
