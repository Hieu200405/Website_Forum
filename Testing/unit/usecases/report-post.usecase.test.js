const ReportRepository = require('../../../Server/src/repositories/report.repository');
const PostRepository = require('../../../Server/src/repositories/post.repository');
const LoggingService = require('../../../Server/src/services/logging.service');
const ModerationService = require('../../../Server/src/services/moderation.service');
const ReportPostUseCase = require('../../../Server/src/usecases/report-post.usecase');

describe('ReportPostUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 400 when reason too short', async () => {
    await expect(ReportPostUseCase.execute(1, 4, 'bad', '1.1.1.1')).rejects.toMatchObject({ status: 400 });
  });

  it('throws 409 when user already reported this post', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({ id: 4 });
    vi.spyOn(ReportRepository, 'exists').mockResolvedValue(true);

    await expect(ReportPostUseCase.execute(1, 4, 'valid reason', '1.1.1.1')).rejects.toMatchObject({ status: 409 });
  });

  it('creates report and triggers moderation check', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({ id: 4 });
    vi.spyOn(ReportRepository, 'exists').mockResolvedValue(false);
    vi.spyOn(ReportRepository, 'create').mockResolvedValue(undefined);
    vi.spyOn(ModerationService, 'hidePostIfExceededReports').mockResolvedValue(undefined);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await ReportPostUseCase.execute(1, 4, 'valid reason', '1.1.1.1');

    expect(result.message).toContain('Báo cáo bài viết thành công');
  });
});
