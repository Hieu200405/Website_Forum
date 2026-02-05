const PostRepository = require('../repositories/post.repository');
const LoggingService = require('../services/logging.service');
const ROLES = require('../constants/roles');

class ModeratePostUseCase {
  /**
   * Duyệt hoặc ẩn bài viết
   * @param {number} userId - ID người thực hiện
   * @param {string} userRole - Role người thực hiện
   * @param {number} postId - ID bài viết
   * @param {string} action - 'approve' | 'hide'
   * @param {string} reason - Lý do (nếu có)
   * @param {string} ip - IP Address
   */
  static async execute(userId, userRole, postId, action, reason, ip) {
    // 1. Check Permission (Dù middleware đã check, check lại ở UseCase để business logic chặt chẽ)
    if (userRole !== ROLES.ADMIN && userRole !== ROLES.MODERATOR) {
        throw { status: 403, message: 'Bạn không có quyền thực hiện hành động này' };
    }

    // 2. Check Post Exists
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw { status: 404, message: 'Bài viết không tồn tại' };
    }

    // 3. Process Action
    let newStatus;
    let logAction;
    let hideReason = null;

    if (action === 'approve') {
      newStatus = 'active';
      logAction = 'APPROVE_POST';
    } else if (action === 'hide') {
      newStatus = 'hidden';
      logAction = 'HIDE_POST';
      hideReason = reason || 'Vi phạm điều khoản cộng đồng';
    } else {
      throw { status: 400, message: 'Hành động không hợp lệ' };
    }

    // 4. Update DB
    await PostRepository.updateModerationStatus(postId, newStatus, hideReason);

    // 5. Logging
    await LoggingService.log(
      userId,
      logAction,
      ip,
      { postId, reason: hideReason, previousStatus: post.status }
    );

    return {
      message: action === 'approve' ? 'Đã duyệt bài viết' : 'Đã ẩn bài viết',
      postId,
      status: newStatus
    };
  }
}

module.exports = ModeratePostUseCase;
