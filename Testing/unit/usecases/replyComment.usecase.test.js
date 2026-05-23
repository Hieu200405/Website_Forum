const CommentRepository = require('../../../Server/src/repositories/comment.repository');
const PostRepository = require('../../../Server/src/repositories/post.repository');
const ModerationService = require('../../../Server/src/services/moderation.service');
const NotificationService = require('../../../Server/src/services/notification.service');
const LoggingService = require('../../../Server/src/services/logging.service');
const ReplyCommentUseCase = require('../../../Server/src/usecases/replyComment.usecase');

describe('ReplyCommentUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 404 when parent comment missing', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({ id: 5 });
    vi.spyOn(CommentRepository, 'findById').mockResolvedValue(null);

    await expect(
      ReplyCommentUseCase.execute(1, { postId: 5, parentCommentId: 9, content: 'ok' }, '1.1.1.1')
    ).rejects.toMatchObject({ status: 404 });
  });

  it('throws 400 when parent comment belongs to different post', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({ id: 5 });
    vi.spyOn(CommentRepository, 'findById').mockResolvedValue({ id: 9, post_id: 99, status: 'active' });

    await expect(
      ReplyCommentUseCase.execute(1, { postId: 5, parentCommentId: 9, content: 'ok' }, '1.1.1.1')
    ).rejects.toMatchObject({ status: 400 });
  });

  it('creates active reply and notifies parent comment owner', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({ id: 5 });
    vi.spyOn(CommentRepository, 'findById').mockResolvedValue({ id: 9, post_id: 5, status: 'active', user_id: 20 });
    vi.spyOn(ModerationService, 'check').mockResolvedValue({ isValid: true, bannedWordsFound: [], aiReason: null });
    vi.spyOn(CommentRepository, 'create').mockResolvedValue({
      id: 10,
      content: 'reply',
      image_url: null,
      status: 'active',
      parent_id: 9,
      created_at: '2026',
    });
    vi.spyOn(PostRepository, 'increaseCommentCount').mockResolvedValue(undefined);
    vi.spyOn(NotificationService, 'createNotification').mockResolvedValue(undefined);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await ReplyCommentUseCase.execute(
      1,
      { postId: 5, parentCommentId: 9, content: 'reply' },
      '1.1.1.1',
      {}
    );

    expect(result.message).toBe('Trả lời thành công');
  });
});
