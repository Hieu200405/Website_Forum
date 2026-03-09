const SavedPostRepository = require('../repositories/savedPost.repository');
const PostRepository = require('../repositories/post.repository');
const LoggingService = require('../services/logging.service');
const RedisService = require('../services/redis.service');

class SavePostUseCase {
  static async execute(userId, postId, ipAddress) {
    const post = await PostRepository.findById(postId);
    if (!post || post.status !== 'active') {
      throw { status: 404, message: 'Bài viết không khả dụng' };
    }

    const isAlreadySaved = await SavedPostRepository.exists(userId, postId);
    if (!isAlreadySaved) {
      await SavedPostRepository.create(userId, postId);
    }

    // Clear Redis cache
    await RedisService.delPattern('posts:feed:*');
    await RedisService.delPattern(`posts:detail:${postId}:*`);

    await LoggingService.log(userId, 'SAVE_POST', ipAddress, { postId });

    return { 
      message: 'Đã lưu bài viết thành công',
      isSaved: true
    };
  }
}

module.exports = SavePostUseCase;
