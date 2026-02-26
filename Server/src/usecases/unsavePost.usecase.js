const SavedPostRepository = require('../repositories/savedPost.repository');
const LoggingService = require('../services/logging.service');

class UnsavePostUseCase {
  static async execute(userId, postId, ipAddress) {
    const isSaved = await SavedPostRepository.exists(userId, postId);
    if (!isSaved) {
      throw { status: 404, message: 'Bài viết chưa được lưu' };
    }

    await SavedPostRepository.delete(userId, postId);
    await LoggingService.log(userId, 'UNSAVE_POST', ipAddress, { postId });

    return { message: 'Đã bỏ lưu bài viết' };
  }
}

module.exports = UnsavePostUseCase;
