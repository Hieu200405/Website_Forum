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
   * @param {string} [params.sortBy='newest'] - 'newest' | 'mostLiked'
   * @returns {Promise<{rows: Post[], count: number}>}
   */
  async findAll({ status, categoryId, page = 1, limit = 10, sortBy = 'newest' } = {}) {
    const offset = (page - 1) * limit;
    const where = {};

    if (status) {
      where.status = status;
    }
    if (categoryId) {
      where.category_id = categoryId;
    }

    // Determine Sort Order
    let order = [['created_at', 'DESC']]; // Default: newest
    if (sortBy === 'mostLiked') {
      order = [['like_count', 'DESC'], ['created_at', 'DESC']];
    } else if (sortBy === 'oldest') {
      order = [['created_at', 'ASC']];
    }

    return await Post.findAndCountAll({
      where,
      limit,
      offset,
      order,
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
   * Cập nhật trạng thái bài viết (cho Moderation)
   * @param {number} id 
   * @param {string} status 
   * @param {string} hideReason 
   * @returns {Promise<boolean>}
   */
  async updateModerationStatus(id, status, hideReason = null) {
    const updateData = { status };
    if (hideReason !== null) {
      updateData.hide_reason = hideReason;
    }
    
    const [updated] = await Post.update(
      updateData,
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

  /**
   * Giảm lượt like (Khi unlike)
   * @param {number} id 
   */
  async decreaseLikeCount(id) {
    await Post.decrement('like_count', { where: { id } });
  }

  /**
   * Lấy danh sách bài viết có sắp xếp (Join Likes & Count)
   * @param {object} params
   */
  async getPostsWithSort({ page, limit, sort, userId = null }) {
    const offset = (page - 1) * limit;
    const { QueryTypes } = require('sequelize');
    const sequelize = require('../config/database');

    let orderByClause = 'p.created_at DESC'; // default newest

    if (sort === 'most_liked') {
      orderByClause = 'likeCount DESC, p.created_at DESC';
    }

    // SQL Query:
    // 1. Join Posts left join Likes
    // 2. Group by Post.id
    // 3. Count likes
    // 4. Sort
    // 5. Paginate
    // 6. Check if current user liked (MAX because aggregate)
    
    // Note: userId replacement handles NULL gracefully
    const currentUserId = userId || null; 

    const sql = `
      SELECT 
        p.id, 
        p.title, 
        p.created_at as createdAt,
        p.user_id as authorId,
        u.username as authorName,
        c.name as categoryName,
        COUNT(DISTINCT l.id) as likeCount,
        COUNT(DISTINCT cm.id) as commentCount,
        MAX(CASE WHEN l.user_id = :userId THEN 1 ELSE 0 END) as isLiked
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments cm ON p.id = cm.post_id AND cm.status = 'active'
      WHERE p.status = 'active'
      GROUP BY p.id, u.username, c.name
      ORDER BY ${orderByClause}
      LIMIT :limit OFFSET :offset
    `;

    const rows = await sequelize.query(sql, {
      replacements: { limit, offset, userId: currentUserId },
      type: QueryTypes.SELECT
    });

    // Count Total (để phân trang)
    // Query count distinct post active
    const countSql = `SELECT COUNT(*) as total FROM posts WHERE status = 'active'`;
    const countResult = await sequelize.query(countSql, { type: QueryTypes.SELECT });
    const total = countResult[0].total;

    return { rows, count: total };
  }
}

module.exports = new PostRepository();
