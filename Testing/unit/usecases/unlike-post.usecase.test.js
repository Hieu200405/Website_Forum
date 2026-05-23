const LikeRepository = require('../../../Server/src/repositories/like.repository');
const PostRepository = require('../../../Server/src/repositories/post.repository');
const UserRepository = require('../../../Server/src/repositories/user.repository');
const LoggingService = require('../../../Server/src/services/logging.service');
const RedisService = require('../../../Server/src/services/redis.service');
const UnlikePostUseCase = require('../../../Server/src/usecases/unlike-post.usecase');

describe('UnlikePostUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 404 when post not found', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue(null);
    await expect(UnlikePostUseCase.execute(1, 5, '1.1.1.1')).rejects.toMatchObject({ status: 404 });
  });

  it('returns early when user has not liked post', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({ id: 5, user_id: 9 });
    vi.spyOn(LikeRepository, 'exists').mockResolvedValue(false);

    const result = await UnlikePostUseCase.execute(1, 5, '1.1.1.1');

    expect(result).toEqual({ message: 'Đã bỏ like bài viết' });
  });

  it('unlikes post and returns updated like count', async () => {
    vi.spyOn(PostRepository, 'findById')
      .mockResolvedValueOnce({ id: 5, user_id: 9 })
      .mockResolvedValueOnce({ id: 5, like_count: 4 });
    vi.spyOn(LikeRepository, 'exists').mockResolvedValue(true);
    vi.spyOn(LikeRepository, 'delete').mockResolvedValue(undefined);
    vi.spyOn(PostRepository, 'decreaseLikeCount').mockResolvedValue(undefined);
    vi.spyOn(UserRepository, 'updateReputation').mockResolvedValue(undefined);
    vi.spyOn(RedisService, 'delPattern').mockResolvedValue(undefined);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await UnlikePostUseCase.execute(1, 5, '1.1.1.1');

    expect(result).toEqual({ message: 'Đã bỏ like bài viết', likeCount: 4, isLiked: false });
  });
});
