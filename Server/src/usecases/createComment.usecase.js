const CommentRepository = require('../repositories/comment.repository');
const PostRepository = require('../repositories/post.repository');
const ModerationService = require('../services/moderation.service');
const LoggingService = require('../services/logging.service');

class CreateCommentUseCase {
  /**
   * Tạo bình luận mới
   * @param {number} userId - ID người tạo
   * @param {object} input - { postId, content, parentId }
   * @param {string} ip - IP người dùng
   */
  static async execute(userId, { postId, content, parentId }, ip) {
    // 1. Validate Input
    if (!content || !content.trim()) {
      throw { status: 400, message: 'Nội dung bình luận không được để trống' };
    }
    if (!postId) {
      throw { status: 400, message: 'Post ID là bắt buộc' };
    }

    // 2. Kiểm tra Post tồn tại
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw { status: 404, message: 'Bài viết không tồn tại' };
    }

    // 3. Moderation Check
    // Note: checkContent trả về Promise<{isValid, bannedWordsFound}> do load DB
    const modResult = await ModerationService.check(content);
    const status = modResult.isValid ? 'active' : 'pending';

    // 4. Create Comment
    const newComment = await CommentRepository.create({
      user_id: userId,
      post_id: postId,
      parent_id: parentId || null,
      content,
      status
    });

    // 5. Update Post Comment Count (Chỉ khi active)
    if (status === 'active') {
        await PostRepository.increaseCommentCount(postId);
    }

    // 6. Logging
    await LoggingService.log(
      userId,
      'CREATE_COMMENT',
      ip,
      { commentId: newComment.id, postId, status }
    );

    return {
      id: newComment.id,
      content: newComment.content,
      status: newComment.status,
      createdAt: newComment.created_at,
      message: !modResult.isValid 
        ? 'Bình luận đang chờ duyệt' 
        : 'Bình luận thành công'
    };
  }
}

module.exports = CreateCommentUseCase;
