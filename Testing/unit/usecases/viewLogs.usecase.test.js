const ViewLogsUseCase = require('../../../Server/src/usecases/viewLogs.usecase');
const LogRepository = require('../../../Server/src/repositories/log.repository');

describe('ViewLogsUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes query params and returns pagination payload', async () => {
    vi.spyOn(LogRepository, 'getLogs').mockResolvedValue({ count: 23, rows: [{ id: 1 }] });

    const result = await ViewLogsUseCase.execute({
      page: '2',
      limit: '5',
      userId: '10',
      action: 'BAN_USER',
      from: '2026-01-01',
      to: '2026-01-31',
    });

    expect(LogRepository.getLogs).toHaveBeenCalledWith({
      userId: 10,
      action: 'BAN_USER',
      from: '2026-01-01',
      to: '2026-01-31',
      page: 2,
      limit: 5,
    });
    expect(result).toEqual({
      page: 2,
      limit: 5,
      total: 23,
      totalPages: 5,
      logs: [{ id: 1 }],
    });
  });

  it('falls back to default page and limit', async () => {
    vi.spyOn(LogRepository, 'getLogs').mockResolvedValue({ count: 0, rows: [] });

    const result = await ViewLogsUseCase.execute({ page: 'NaN', limit: '' });

    expect(LogRepository.getLogs).toHaveBeenCalledWith({
      userId: null,
      action: undefined,
      from: undefined,
      to: undefined,
      page: 1,
      limit: 10,
    });
    expect(result).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0, logs: [] });
  });
});
