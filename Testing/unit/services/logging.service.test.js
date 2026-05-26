const SystemLogRepository = require('../../../Server/src/repositories/systemLog.repository');
const LoggingService = require('../../../Server/src/services/logging.service');

describe('LoggingService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('serializes object data and forwards payload to repository', async () => {
    const createSpy = vi.spyOn(SystemLogRepository, 'create').mockResolvedValue(undefined);

    await LoggingService.log('12', 'LOGIN', '1.1.1.1', { a: 1 }, 'INFO');

    expect(createSpy).toHaveBeenCalledWith({
      userId: 12,
      action: 'LOGIN',
      ip: '1.1.1.1',
      data: JSON.stringify({ a: 1 }),
      level: 'INFO',
    });
  });

  it('keeps string data unchanged', async () => {
    const createSpy = vi.spyOn(SystemLogRepository, 'create').mockResolvedValue(undefined);

    await LoggingService.log(1, 'ACTION', '1.1.1.1', 'raw-data', 'WARN');

    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ data: 'raw-data', level: 'WARN' }));
  });

  it('sets nullable fields when userId/data missing', async () => {
    const createSpy = vi.spyOn(SystemLogRepository, 'create').mockResolvedValue(undefined);

    await LoggingService.log(null, 'GUEST', '1.1.1.1');

    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ userId: null, data: null }));
  });

  it('swallows repository errors and does not throw', async () => {
    vi.spyOn(SystemLogRepository, 'create').mockRejectedValue(new Error('db down'));

    await expect(LoggingService.log(1, 'X', '1.1.1.1')).resolves.toBeUndefined();
  });

  it('delegates getLogs with default limit', async () => {
    const findSpy = vi.spyOn(SystemLogRepository, 'findAll').mockResolvedValue([]);

    await LoggingService.getLogs();

    expect(findSpy).toHaveBeenCalledWith({ limit: 100 });
  });

  it('delegates getLogs with custom limit', async () => {
    const findSpy = vi.spyOn(SystemLogRepository, 'findAll').mockResolvedValue([]);

    await LoggingService.getLogs(25);

    expect(findSpy).toHaveBeenCalledWith({ limit: 25 });
  });
});
