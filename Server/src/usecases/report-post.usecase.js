const ReportRepository = require('../repositories/report.repository');
const PostRepository = require('../repositories/post.repository');
const LoggingService = require('../services/logging.service');
const ModerationService = require('../services/moderation.service');

class ReportPostUseCase {
  /**
   * Báo cáo bài viết vi phạm
   * @param {number} userId 
   * @param {number} postId 
   * @param {string} reason 
   * @param {string} ipAddress 
   */
  static async execute(userId, postId, reason, ipAddress) {
    // 1. Validate Input
    if (!reason || reason.trim().length < 5) {
      throw { status: 400, message: 'Lý do báo cáo phải từ 5 ký tự trở lên' };
    }

    // 2. Kiểm tra Post tồn tại
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw { status: 404, message: 'Bài viết không tồn tại' };
    }

    // 3. Kiểm tra đã report chưa (Anti-spam)
    const hasReported = await ReportRepository.exists(userId, postId);
    if (hasReported) {
      throw { status: 409, message: 'Bạn đã báo cáo bài viết này rồi' };
    }

    // 4. Create Report
    await ReportRepository.create({
      user_id: userId,
      post_id: postId,
      reason
    });

    // 5. Auto-Moderation check
    await ModerationService.hidePostIfExceededReports(postId);

    // 6. Log Action
    await LoggingService.log(userId, 'REPORT_POST', ipAddress, { postId, reason });

    return { message: 'Báo cáo bài viết thành công. Quản trị viên sẽ xem xét.' };
  }
}

module.exports = ReportPostUseCase;
