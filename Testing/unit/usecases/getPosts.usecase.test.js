const PostRepository = require('../../../Server/src/repositories/post.repository');
const RedisService = require('../../../Server/src/services/redis.service');
const GetPostsUseCase = require('../../../Server/src/usecases/getPosts.usecase');

describe('GetPostsUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns cached result when cache hit', async () => {
    vi.spyOn(RedisService, 'get').mockResolvedValue(JSON.stringify({ page: 1, limit: 10, total: 0, data: [] }));

    const result = await GetPostsUseCase.execute({ page: 1, limit: 10, sort: 'newest', userId: null });

    expect(result).toEqual({ page: 1, limit: 10, total: 0, data: [] });
  });

  it('defaults invalid sort to newest and formats repository rows', async () => {
    vi.spyOn(RedisService, 'get').mockResolvedValue(null);
    vi.spyOn(RedisService, 'set').mockResolvedValue(undefined);
    vi.spyOn(PostRepository, 'getPostsWithSort').mockResolvedValue({
      count: 1,
      rows: [
        {
          id: 1,
          title: 't',
          content: 'c',
          imageUrl: 'img',
          likeCount: '5',
          commentCount: '2',
          createdAt: '2026-05-23',
          categoryId: 3,
          categoryName: 'Cat',
          authorId: 9,
          authorName: 'a',
          authorAvatar: 'av',
          authorReputation: '12',
          isFollowingAuthor: '1',
          isLiked: '1',
          isSaved: '0',
        },
      ],
    });

    const result = await GetPostsUseCase.execute({ page: 'x', limit: 'y', sort: 'invalid', userId: null });

    expect(result.data[0].likeCount).toBe(5);
    expect(result.data[0].isLiked).toBe(true);
  });

  it('uses short cache ttl for logged in user', async () => {
    vi.spyOn(RedisService, 'get').mockResolvedValue(null);
    const setSpy = vi.spyOn(RedisService, 'set').mockResolvedValue(undefined);
    vi.spyOn(PostRepository, 'getPostsWithSort').mockResolvedValue({ count: 0, rows: [] });

    await GetPostsUseCase.execute({ page: 1, limit: 10, sort: 'for_you', userId: 7 });

    expect(setSpy).toHaveBeenCalledWith(expect.any(String), expect.any(String), 3);
  });
});
