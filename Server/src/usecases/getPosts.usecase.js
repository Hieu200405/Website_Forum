const PostRepository = require('../repositories/post.repository');

class GetPostsUseCase {
  /**
   * Lấy danh sách bài viết
   * @param {object} params
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số lượng bài trên mỗi trang
   * @param {number} [params.categoryId] - Lọc theo danh mục
   * @param {string} [params.sortBy='newest'] - Sắp xếp ('newest' | 'mostLiked')
   * @returns {Promise<object>}
   */
  static async execute({ page = 1, limit = 10, categoryId, sortBy = 'newest' }) {
    // 1. Chuẩn hóa tham số
    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.max(1, Math.min(50, parseInt(limit))); // Limit max 50 to prevent overflow

    // 2. Gọi Repository logic
    const { rows, count } = await PostRepository.findAll({
      status: 'active', // Chỉ lấy bài active cho public view
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      page: pageNumber,
      limit: limitNumber,
      sortBy
    });

    // 3. Format dữ liệu trả về theo yêu cầu
    const posts = rows.map(post => ({
      id: post.id,
      title: post.title,
      author: post.author ? post.author.username : 'Unknown', // Join user
      category: post.category ? post.category.name : null,
      categoryId: post.category_id,
      likes: post.like_count || 0,
      comments: post.comment_count || 0,
      createdAt: post.created_at
    }));

    // 4. Trả về
    return {
      page: pageNumber,
      limit: limitNumber,
      total: count,
      totalPages: Math.ceil(count / limitNumber),
      posts
    };
  }
}

module.exports = GetPostsUseCase;
