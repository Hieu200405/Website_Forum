const PostRepository = require('../repositories/post.repository');
const RedisService = require('../services/redis.service');

class GetPostsUseCase {
  static async execute({ page, limit, sort, userId, authorId, search, categoryId }) {
    // 1. Default Values
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const s = sort || 'newest';

    // 2. Validate Sort
    const validSorts = ['newest', 'most_liked', 'for_you'];
    const finalSort = validSorts.includes(s) ? s : 'newest';

    // 3. Cache Key Strategy
    const searchPart = search ? `q${encodeURIComponent(search)}` : 'no-search';
    const catPart = categoryId ? `c${categoryId}` : 'all-cats';
    const cacheKey = `posts:feed:p${p}:l${l}:s${finalSort}:u${userId || 'public'}:a${authorId || 'all'}:${searchPart}:${catPart}`;
    
    // Check Cache
    const cachedData = await RedisService.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    // 4. Call Repository
    const result = await PostRepository.getPostsWithSort({
      page: p,
      limit: l,
      sort: finalSort,
      userId,
      authorId,
      search,
      categoryId
    });

    // 5. Format Output
    const responseData = {
      page: p,
      limit: l,
      total: result.count,
      data: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        imageUrl: row.imageUrl,
        likeCount: parseInt(row.likeCount), 
        commentCount: parseInt(row.commentCount) || 0,
        createdAt: row.createdAt,
        categoryId: row.categoryId,
        category: row.categoryName || 'Thảo luận',
        author: {
          id: row.authorId,
          username: row.authorName || 'Người dùng ẩn danh',
          avatar: row.authorAvatar,
          reputation: parseInt(row.authorReputation) || 0,
          isFollowing: !!parseInt(row.isFollowingAuthor)
        },
        isLiked: !!parseInt(row.isLiked), // Convert to boolean
        isSaved: !!parseInt(row.isSaved)
      }))
    };

    // Save to Cache (Logged in users get 3s cache for snappiness, public gets 120s)
    const expiry = userId ? 3 : 120;
    await RedisService.set(cacheKey, JSON.stringify(responseData), expiry);

    return responseData;
  }
}

module.exports = GetPostsUseCase;
