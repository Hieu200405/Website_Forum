const LikeRepository = require('../../../Server/src/repositories/like.repository');
const PostRepository = require('../../../Server/src/repositories/post.repository');
const UserRepository = require('../../../Server/src/repositories/user.repository');
const LoggingService = require('../../../Server/src/services/logging.service');
const NotificationService = require('../../../Server/src/services/notification.service');
const RedisService = require('../../../Server/src/services/redis.service');
const LikePostUseCase = require('../../../Server/src/usecases/like-post.usecase');

describe('LikePostUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 404 when post does not exist', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue(null);
    await expect(LikePostUseCase.execute(1, 99, '1.1.1.1')).rejects.toMatchObject({ status: 404 });
  });

  it('returns early when post already liked', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({ id: 3, status: 'active', user_id: 9 });
    vi.spyOn(LikeRepository, 'exists').mockResolvedValue(true);

    const result = await LikePostUseCase.execute(1, 3, '1.1.1.1');

    expect(result).toEqual({ message: 'Đã like bài viết' });
  });

  it('likes post and returns latest like count', async () => {
    vi.spyOn(PostRepository, 'findById')
      .mockResolvedValueOnce({ id: 3, status: 'active', user_id: 9 })
      .mockResolvedValueOnce({ id: 3, like_count: 11 });
    vi.spyOn(LikeRepository, 'exists').mockResolvedValue(false);
    vi.spyOn(LikeRepository, 'create').mockResolvedValue(undefined);
    vi.spyOn(PostRepository, 'increaseLikeCount').mockResolvedValue(undefined);
    vi.spyOn(UserRepository, 'updateReputation').mockResolvedValue(undefined);
    vi.spyOn(RedisService, 'delPattern').mockResolvedValue(undefined);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);
    vi.spyOn(NotificationService, 'createNotification').mockResolvedValue(undefined);

    const result = await LikePostUseCase.execute(1, 3, '1.1.1.1', {});

    expect(result).toEqual({ message: 'Đã like bài viết', likeCount: 11, isLiked: true });
  });
});
