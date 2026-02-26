const SavedPostRepository = require('../repositories/savedPost.repository');
const PostRepository = require('../repositories/post.repository');
const LoggingService = require('../services/logging.service');

class SavePostUseCase {
  static async execute(userId, postId, ipAddress) {
    const post = await PostRepository.findById(postId);
    if (!post || post.status !== 'active') {
      throw { status: 404, message: 'Bài viết không khả dụng' };
    }

    const isSaved = await SavedPostRepository.exists(userId, postId);
    if (isSaved) {
      throw { status: 409, message: 'Bài viết đã được lưu trước đó' };
    }

    await SavedPostRepository.create(userId, postId);
    await LoggingService.log(userId, 'SAVE_POST', ipAddress, { postId });

    return { message: 'Đã lưu bài viết thành công' };
  }
}

module.exports = SavePostUseCase;
