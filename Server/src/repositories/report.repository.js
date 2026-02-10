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

  async countByStatus(status) {
    return await Report.count({
        where: { status }
    });
  }

  async updateStatusByPostId(postId, status) {
    return await Report.update(
        { status },
        { where: { post_id: postId } }
    );
  }

  async findAll({ limit, offset, order = [['created_at', 'DESC']], status }) {
      try {
          // Lazy load models to avoid circular dependency issues if any
          const User = require('../models/user.model');
          const Post = require('../models/post.model');

          const where = {};
          if (status) {
              where.status = status;
          }

          return await Report.findAndCountAll({
              where,
              limit,
              offset,
              order,
              include: [
                  { model: User, as: 'reporter', attributes: ['id', 'username', 'email'] },
                  { model: Post, as: 'post', attributes: ['id', 'title', 'status', 'content'] }
              ]
          });
      } catch (error) {
          console.error('[ReportRepository] findAll error:', error);
          throw error;
      }
  }
}

module.exports = new ReportRepository();
