const PostRepository = require('../repositories/post.repository');
const RedisService = require('../services/redis.service');

class GetPostsUseCase {
  static async execute({ page, limit, sort, userId, authorId, search }) {
    // 1. Default Values
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const s = sort || 'newest';

    // 2. Validate Sort
    const validSorts = ['newest', 'most_liked'];
    const finalSort = validSorts.includes(s) ? s : 'newest';

    // 3. Cache Key Strategy
    // We cache based on page, limit, sort, and authorId.
    // If userId is provided, we can't fully cache the "isLiked/isSaved" globally for all users.
    // However, as an advanced optimization: we can cache the base query and then append user-specific data, 
    // OR we just cache the request per-user if logged in. For public feed, cache globally.
    // Added Search query to cache key
    const searchPart = search ? `q${encodeURIComponent(search)}` : 'no-search';
    const cacheKey = `posts:feed:p${p}:l${l}:s${finalSort}:u${userId || 'public'}:a${authorId || 'all'}:${searchPart}`;
    
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
      search
    });

    // 5. Format Output
    const responseData = {
      page: p,
      limit: l,
      total: result.count,
      data: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        likeCount: parseInt(row.likeCount), 
        commentCount: parseInt(row.commentCount) || 0,
        createdAt: row.createdAt,
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
