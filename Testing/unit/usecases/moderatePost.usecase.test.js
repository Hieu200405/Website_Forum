const PostRepository = require('../../../Server/src/repositories/post.repository');
const UserRepository = require('../../../Server/src/repositories/user.repository');
const LoggingService = require('../../../Server/src/services/logging.service');
const ReportRepository = require('../../../Server/src/repositories/report.repository');
const NotificationService = require('../../../Server/src/services/notification.service');
const ModeratePostUseCase = require('../../../Server/src/usecases/moderatePost.usecase');

describe('ModeratePostUseCase.execute', () => {
  const basePost = { id: 20, title: 'post', status: 'pending', user_id: 5, author: { id: 5 } };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 403 when role is not admin/moderator', async () => {
    await expect(ModeratePostUseCase.execute(1, 'USER', 20, 'approve', null, '1.1.1.1')).rejects.toMatchObject({ status: 403 });
  });

  it('throws 400 when action invalid', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue(basePost);
    await expect(ModeratePostUseCase.execute(1, 'ADMIN', 20, 'invalid', null, '1.1.1.1')).rejects.toMatchObject({ status: 400 });
  });

  it('approves post and rewards author', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue(basePost);
    vi.spyOn(PostRepository, 'updateModerationStatus').mockResolvedValue(true);
    vi.spyOn(ReportRepository, 'updateStatusByPostId').mockResolvedValue(undefined);
    vi.spyOn(UserRepository, 'updateReputation').mockResolvedValue(undefined);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);
    vi.spyOn(NotificationService, 'createNotification').mockResolvedValue(undefined);

    const result = await ModeratePostUseCase.execute(1, 'ADMIN', 20, 'approve', null, '1.1.1.1', {});

    expect(result).toEqual({ message: 'Đã duyệt bài viết', postId: 20, status: 'active' });
  });

  it('deletes post and returns deleted status', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue(basePost);
    vi.spyOn(PostRepository, 'delete').mockResolvedValue(true);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await ModeratePostUseCase.execute(1, 'MODERATOR', 20, 'delete', 'severe', '1.1.1.1');

    expect(result).toEqual({ message: 'Đã xóa bài viết vĩnh viễn', postId: 20, status: 'deleted' });
  });
});
