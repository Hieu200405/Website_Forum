const Report = require('../models/report.model');

class ReportRepository {
  /**
   * Kiểm tra user đã report post chưa
   * @param {number} userId 
   * @param {number} postId 
   * @returns {Promise<boolean>}
   */
  async exists(userId, postId) {
    const report = await Report.findOne({
      where: { user_id: userId, post_id: postId }
    });
    return !!report;
  }

  /**
   * Tạo report mới
   * @param {object} data
   * @returns {Promise<Report>}
   */
  async create(data) {
    return await Report.create(data);
  }

  /**
   * Đếm số lượng report của một bài viết
   * @param {number} postId 
   * @returns {Promise<number>}
   */
  async countByPostId(postId) {
    return await Report.count({
      where: { post_id: postId }
    });
  }
}

module.exports = new ReportRepository();
