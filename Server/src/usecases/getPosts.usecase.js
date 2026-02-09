const PostRepository = require('../repositories/post.repository');

class GetPostsUseCase {
  static async execute({ page, limit, sort, userId }) {
    // 1. Default Values
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const s = sort || 'newest';

    // 2. Validate Sort
    const validSorts = ['newest', 'most_liked'];
    const finalSort = validSorts.includes(s) ? s : 'newest';

    // 3. Call Repository
    const result = await PostRepository.getPostsWithSort({
      page: p,
      limit: l,
      sort: finalSort,
      userId
    });

    // 4. Format Output
    return {
      page: p,
      limit: l,
      total: result.count,
      data: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        likeCount: parseInt(row.likeCount), 
        createdAt: row.createdAt,
        category: row.categoryName || 'Thảo luận',
        author: {
          id: row.authorId,
          username: row.authorName || 'Người dùng ẩn danh'
        },
        isLiked: !!parseInt(row.isLiked) // Convert to boolean
      }))
    };
  }
}

module.exports = GetPostsUseCase;
