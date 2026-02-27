const ReportRepository = require('../repositories/report.repository');
const SystemLogRepository = require('../repositories/systemLog.repository');
const PostRepository = require('../repositories/post.repository');

class GetModerationStatsUseCase {
  static async execute() {
    const pendingReports = await ReportRepository.countByStatus('pending');
    
    const pendingPosts = await PostRepository.countByStatus('pending');

    // Đếm số lượng hành động xử lý trong ngày (Approve, Hide, Delete)
    const reviewedReportsToday = await SystemLogRepository.countModerationActionsToday();

    return {
      pendingReports,
      pendingPosts,
      reviewedReports: reviewedReportsToday, // Hiển thị số lượng xử lý trong ngày
    };
  }
}

module.exports = GetModerationStatsUseCase;
