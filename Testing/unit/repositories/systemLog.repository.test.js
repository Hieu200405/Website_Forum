const path = require('path');
const { createRequire } = require('module');

const serverRequire = createRequire(path.resolve(__dirname, '../../../Server/package.json'));
const { Op } = serverRequire('sequelize');
const SystemLogRepository = require('../../../Server/src/repositories/systemLog.repository');
const SystemLog = require('../../../Server/src/models/systemLog.model');

describe('SystemLogRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('create forwards payload to model', async () => {
    vi.spyOn(SystemLog, 'create').mockResolvedValue({ id: 1 });

    await SystemLogRepository.create({ action: 'LOGIN', level: 'INFO' });

    expect(SystemLog.create).toHaveBeenCalledWith({ action: 'LOGIN', level: 'INFO' });
  });

  it('findAll uses defaults', async () => {
    vi.spyOn(SystemLog, 'findAll').mockResolvedValue([]);

    await SystemLogRepository.findAll();

    expect(SystemLog.findAll).toHaveBeenCalledWith({
      limit: 100,
      offset: 0,
      order: [['created_at', 'DESC']],
    });
  });

  it('countModerationActionsToday queries with action set and startOfDay', async () => {
    vi.spyOn(SystemLog, 'count').mockResolvedValue(9);

    const result = await SystemLogRepository.countModerationActionsToday();

    expect(result).toBe(9);

    const arg = SystemLog.count.mock.calls[0][0];
    expect(arg.where.action[Op.in]).toEqual(['APPROVE_POST', 'HIDE_POST', 'DELETE_POST']);
    expect(arg.where.created_at[Op.gte]).toBeInstanceOf(Date);
  });
});
