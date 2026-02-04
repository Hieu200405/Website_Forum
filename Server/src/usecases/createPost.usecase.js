const PostRepository = require('../repositories/post.repository');
const CategoryRepository = require('../repositories/category.repository');
const ModerationService = require('../services/moderation.service');
const LoggingService = require('../services/logging.service');

class CreatePostUseCase {
  /**
   * Tạo bài viết mới
   * @param {number} userId - ID người tạo
   * @param {object} input - Dữ liệu { title, content, categoryId }
   * @param {string} ip - IP User
    */
  static async execute(userId, { title, content, categoryId }, ip) {
    // 1. Validate Input cơ bản
    if (!title || title.length > 200) {
      throw { status: 400, message: 'Title is required and must be under 200 characters' };
    }
    if (!content) {
      throw { status: 400, message: 'Content is required' };
    }
    if (!categoryId) {
      throw { status: 400, message: 'Category ID is required' };
    }

    // 2. Kiểm tra Category tồn tại
    const category = await CategoryRepository.findById(categoryId);
    if (!category) {
      throw { status: 404, message: 'Category not found' };
    }

    // 3. Kiểm duyệt nội dung (Moderation)
    const isViolation = ModerationService.checkContent(title, content);
    const status = isViolation ? 'pending' : 'active';

    // 4. Lưu bài viết
    const newPost = await PostRepository.create({
      user_id: userId,
      category_id: categoryId,
      title,
      content,
      status
    });

    // 5. Ghi log
    await LoggingService.log(
      userId,
      'CREATE_POST',
      ip,
      { postId: newPost.id, title: newPost.title, status }
    );

    return {
      id: newPost.id,
      title: newPost.title,
      status: newPost.status,
      created_at: newPost.created_at,
      message: isViolation 
        ? 'Bài viết của bạn đang chờ duyệt do nghi ngờ vi phạm nội dung.'
        : 'Đăng bài thành công'
    };
  }
}

module.exports = CreatePostUseCase;
