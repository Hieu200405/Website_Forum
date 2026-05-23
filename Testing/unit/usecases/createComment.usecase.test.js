const CommentRepository = require('../../../Server/src/repositories/comment.repository');
const PostRepository = require('../../../Server/src/repositories/post.repository');
const ModerationService = require('../../../Server/src/services/moderation.service');
const LoggingService = require('../../../Server/src/services/logging.service');
const NotificationService = require('../../../Server/src/services/notification.service');
const CreateCommentUseCase = require('../../../Server/src/usecases/createComment.usecase');

describe('CreateCommentUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 400 when content empty', async () => {
    await expect(
      CreateCommentUseCase.execute(1, { postId: 2, content: '   ' }, '1.1.1.1')
    ).rejects.toMatchObject({ status: 400 });
  });

  it('throws 404 when post does not exist', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue(null);
    await expect(
      CreateCommentUseCase.execute(1, { postId: 2, content: 'ok' }, '1.1.1.1')
    ).rejects.toMatchObject({ status: 404 });
  });

  it('creates active comment, increments count, sends notification', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({ id: 2, user_id: 10 });
    vi.spyOn(ModerationService, 'check').mockResolvedValue({ isValid: true, bannedWordsFound: [], aiReason: null });
    vi.spyOn(CommentRepository, 'create').mockResolvedValue({ id: 7, content: 'ok', image_url: null, status: 'active', created_at: '2026' });
    vi.spyOn(PostRepository, 'increaseCommentCount').mockResolvedValue(undefined);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);
    vi.spyOn(NotificationService, 'createNotification').mockResolvedValue(undefined);

    const result = await CreateCommentUseCase.execute(1, { postId: 2, content: 'ok' }, '1.1.1.1', {});

    expect(result.message).toBe('Bình luận thành công');
  });

  it('creates pending comment and skips count/notification when moderated', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({ id: 2, user_id: 10 });
    vi.spyOn(ModerationService, 'check').mockResolvedValue({ isValid: false, bannedWordsFound: ['x'], aiReason: 'flag' });
    vi.spyOn(CommentRepository, 'create').mockResolvedValue({ id: 8, content: 'bad', image_url: null, status: 'pending', created_at: '2026' });
    const incSpy = vi.spyOn(PostRepository, 'increaseCommentCount').mockResolvedValue(undefined);
    const notifySpy = vi.spyOn(NotificationService, 'createNotification').mockResolvedValue(undefined);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await CreateCommentUseCase.execute(1, { postId: 2, content: 'bad' }, '1.1.1.1', {});

    expect(incSpy).not.toHaveBeenCalled();
    expect(notifySpy).not.toHaveBeenCalled();
    expect(result.message).toBe('Bình luận đang chờ duyệt');
  });
});
