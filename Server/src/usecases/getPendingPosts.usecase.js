const PostRepository = require('../repositories/post.repository');

class GetPendingPostsUseCase {
  static async execute({ page = 1, limit = 10 } = {}) {
    const { rows, count } = await PostRepository.findAll({
      status: 'pending',
      page: parseInt(page),
      limit: parseInt(limit)
    });

    return {
      posts: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    };
  }
}

module.exports = GetPendingPostsUseCase;
