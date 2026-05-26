const GetModerationStatsUseCase = require('../../../Server/src/usecases/getModerationStats.usecase');
const ReportRepository = require('../../../Server/src/repositories/report.repository');
const SystemLogRepository = require('../../../Server/src/repositories/systemLog.repository');
const PostRepository = require('../../../Server/src/repositories/post.repository');

describe('GetModerationStatsUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('aggregates pending reports, pending posts, reviewed reports', async () => {
    vi.spyOn(ReportRepository, 'countByStatus').mockResolvedValue(4);
    vi.spyOn(PostRepository, 'countByStatus').mockResolvedValue(6);
    vi.spyOn(SystemLogRepository, 'countModerationActionsToday').mockResolvedValue(8);

    const result = await GetModerationStatsUseCase.execute();

    expect(ReportRepository.countByStatus).toHaveBeenCalledWith('pending');
    expect(PostRepository.countByStatus).toHaveBeenCalledWith('pending');
    expect(result).toEqual({ pendingReports: 4, pendingPosts: 6, reviewedReports: 8 });
  });
});
