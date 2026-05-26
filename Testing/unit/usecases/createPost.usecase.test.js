const PostRepository = require('../../../Server/src/repositories/post.repository');
const CategoryRepository = require('../../../Server/src/repositories/category.repository');
const ModerationService = require('../../../Server/src/services/moderation.service');
const LoggingService = require('../../../Server/src/services/logging.service');
const RedisService = require('../../../Server/src/services/redis.service');
const CreatePostUseCase = require('../../../Server/src/usecases/createPost.usecase');

describe('CreatePostUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 404 when category does not exist', async () => {
    vi.spyOn(CategoryRepository, 'findById').mockResolvedValue(null);

    await expect(
      CreatePostUseCase.execute(1, { title: 'Valid title', content: 'content', categoryId: 99 }, '1.1.1.1')
    ).rejects.toMatchObject({ status: 404, message: 'Category not found' });
  });

  it('creates active post when moderation valid', async () => {
    vi.spyOn(CategoryRepository, 'findById').mockResolvedValue({ id: 2 });
    vi.spyOn(ModerationService, 'check').mockResolvedValue({ isValid: true, bannedWordsFound: [], aiReason: null });
    vi.spyOn(PostRepository, 'create').mockResolvedValue({
      id: 10,
      title: 'hello',
      image_url: null,
      status: 'active',
      created_at: '2026-05-23',
    });
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);
    vi.spyOn(RedisService, 'delPattern').mockResolvedValue(undefined);

    const result = await CreatePostUseCase.execute(
      1,
      { title: 'hello', content: 'body', categoryId: 2, imageUrl: null },
      '1.1.1.1'
    );

    expect(result.message).toBe('Đăng bài thành công');
  });

  it('creates pending post when moderation flags violation', async () => {
    vi.spyOn(CategoryRepository, 'findById').mockResolvedValue({ id: 2 });
    vi.spyOn(ModerationService, 'check')
      .mockResolvedValueOnce({ isValid: false, bannedWordsFound: ['badword'], aiReason: 'toxicity' })
      .mockResolvedValueOnce({ isValid: true, bannedWordsFound: [], aiReason: null });
    vi.spyOn(PostRepository, 'create').mockResolvedValue({
      id: 11,
      title: 'x',
      image_url: null,
      status: 'pending',
      created_at: '2026-05-23',
    });
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);
    vi.spyOn(RedisService, 'delPattern').mockResolvedValue(undefined);

    const result = await CreatePostUseCase.execute(
      1,
      { title: 'x', content: 'y', categoryId: 2, imageUrl: null },
      '2.2.2.2'
    );

    expect(result.message).toBe('Bài viết của bạn đang chờ duyệt do nghi ngờ vi phạm nội dung.');
  });
});
