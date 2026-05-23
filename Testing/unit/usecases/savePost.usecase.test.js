const SavedPostRepository = require('../../../Server/src/repositories/savedPost.repository');
const PostRepository = require('../../../Server/src/repositories/post.repository');
const LoggingService = require('../../../Server/src/services/logging.service');
const RedisService = require('../../../Server/src/services/redis.service');
const SavePostUseCase = require('../../../Server/src/usecases/savePost.usecase');

describe('SavePostUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 404 when post unavailable', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue(null);
    await expect(SavePostUseCase.execute(1, 5, '1.1.1.1')).rejects.toMatchObject({ status: 404 });
  });

  it('creates save when not saved yet', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({ id: 5, status: 'active' });
    vi.spyOn(SavedPostRepository, 'exists').mockResolvedValue(false);
    vi.spyOn(SavedPostRepository, 'create').mockResolvedValue(undefined);
    vi.spyOn(RedisService, 'delPattern').mockResolvedValue(undefined);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await SavePostUseCase.execute(1, 5, '1.1.1.1');

    expect(result).toEqual({ message: 'Đã lưu bài viết thành công', isSaved: true });
  });
});
