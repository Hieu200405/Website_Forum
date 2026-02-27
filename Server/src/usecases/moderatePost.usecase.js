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
   * @param {object} app - Express app instance for socket.io
   */
  static async execute(userId, userRole, postId, action, reason, ip, app) {
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
    } else if (action === 'delete') {
      // Action Delete: Xóa luôn khỏi DB
      await PostRepository.delete(postId);
      
      await LoggingService.log(
        userId,
        'DELETE_POST',
        ip,
        { postId, reason: reason || 'Vi phạm nghiêm trọng', previousStatus: post.status }
      );

      return {
        message: 'Đã xóa bài viết vĩnh viễn',
        postId,
        status: 'deleted'
      };
    } else {
      throw { status: 400, message: 'Hành động không hợp lệ' };
    }

    // 4. Update DB (chỉ áp dụng cho approve/hide)
    await PostRepository.updateModerationStatus(postId, newStatus, hideReason);

    // Update Report status to 'reviewed'
    const ReportRepository = require('../repositories/report.repository');
    await ReportRepository.updateStatusByPostId(postId, 'reviewed');

    // 5. Logging
    await LoggingService.log(
      userId,
      logAction,
      ip,
      { postId, reason: hideReason, previousStatus: post.status }
    );

    // 6. Notifications
    const NotificationService = require('../services/notification.service');
    if (app) {
        if (action === 'approve') {
            await NotificationService.createNotification(app, {
                user_id: post.user_id || post.author?.id,
                sender_id: userId,
                type: 'APPROVE',
                reference_id: post.id,
                content: `Bài viết "${post.title}" của bạn đã được duyệt và hiển thị trên bảng tin.`
            });
        } else if (action === 'hide') {
            await NotificationService.createNotification(app, {
                user_id: post.user_id || post.author?.id,
                sender_id: userId,
                type: 'REJECT',
                reference_id: post.id,
                content: `Bài viết "${post.title}" của bạn đã bị từ chối/ẩn. Lý do: ${hideReason}`
            });
        }
    }

    return {
      message: action === 'approve' ? 'Đã duyệt bài viết' : 'Đã ẩn bài viết',
      postId,
      status: newStatus
    };
  }
}

module.exports = ModeratePostUseCase;
