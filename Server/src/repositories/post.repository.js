const Post = require('../models/post.model');
const User = require('../models/user.model');
const Category = require('../models/category.model');

class PostRepository {
  /**
   * Tạo bài viết mới
   * @param {object} postData 
   * @returns {Promise<Post>}
   */
  async create(postData) {
    return await Post.create(postData);
  }

  /**
   * Tìm bài viết theo ID
   * @param {number} id 
   * @returns {Promise<Post|null>}
   */
  async findById(id) {
    return await Post.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'role'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });
  }

  /**
   * Lấy danh sách bài viết với bộ lọc và phân trang
   * @param {object} params
   * @param {string} [params.status] - Trạng thái bài viết
   * @param {number} [params.categoryId] - ID danh mục
   * @param {number} [params.page=1] - Trang hiện tại
   * @param {number} [params.limit=10] - Số lượng mỗi trang
   * @returns {Promise<{rows: Post[], count: number}>}
   */
  async findAll({ status, categoryId, page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }
    if (categoryId) {
      where.category_id = categoryId;
    }

    return await Post.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'author', attributes: ['id', 'username'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });
  }

  /**
   * Cập nhật trạng thái bài viết
   * @param {number} id 
   * @param {string} status 
   * @returns {Promise<boolean>}
   */
  async updateStatus(id, status) {
    const [updated] = await Post.update(
      { status },
      { where: { id } }
    );
    return updated > 0;
  }

  /**
   * Tăng lượt like
   * @param {number} id 
   * @returns {Promise<void>}
   */
  async increaseLikeCount(id) {
    await Post.increment('like_count', { where: { id } });
  }

  /**
   * Tăng lượt comment
   * @param {number} id 
   * @returns {Promise<void>}
   */
  async increaseCommentCount(id) {
    await Post.increment('comment_count', { where: { id } });
  }
}

module.exports = new PostRepository();
