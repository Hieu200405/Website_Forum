const ReportRepository = require('../repositories/report.repository');
// const PostRepository = require('../repositories/post.repository'); // Uncomment if needed

class GetModerationStatsUseCase {
  static async execute() {
    const pendingReports = await ReportRepository.countByStatus('pending');
    const reviewedReports = await ReportRepository.countByStatus('reviewed');
    
    // Nếu có Post status 'pending' (post cần duyệt), thêm logic ở đây
    // const pendingPosts = await PostRepository.countByStatus('pending');

    return {
      pendingReports,
      reviewedReports,
      // pendingPosts
    };
  }
}

module.exports = GetModerationStatsUseCase;
