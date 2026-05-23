const SavedPostRepository = require('../../../Server/src/repositories/savedPost.repository');
const LoggingService = require('../../../Server/src/services/logging.service');
const RedisService = require('../../../Server/src/services/redis.service');
const UnsavePostUseCase = require('../../../Server/src/usecases/unsavePost.usecase');

describe('UnsavePostUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not delete when post was not saved', async () => {
    vi.spyOn(SavedPostRepository, 'exists').mockResolvedValue(false);
    vi.spyOn(RedisService, 'delPattern').mockResolvedValue(undefined);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await UnsavePostUseCase.execute(1, 5, '1.1.1.1');

    expect(result).toEqual({ message: 'Đã bỏ lưu bài viết', isSaved: false });
  });

  it('deletes save and clears cache when already saved', async () => {
    vi.spyOn(SavedPostRepository, 'exists').mockResolvedValue(true);
    vi.spyOn(SavedPostRepository, 'delete').mockResolvedValue(undefined);
    vi.spyOn(RedisService, 'delPattern').mockResolvedValue(undefined);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    await UnsavePostUseCase.execute(1, 5, '1.1.1.1');

    expect(SavedPostRepository.delete).toHaveBeenCalledWith(1, 5);
  });
});
