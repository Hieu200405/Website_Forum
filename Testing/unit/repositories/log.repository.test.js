const LogRepository = require('../../../Server/src/repositories/log.repository');
const sequelize = require('../../../Server/src/config/database');

describe('LogRepository.getLogs', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('builds SQL with all optional filters and parses JSON user', async () => {
    const querySpy = vi.spyOn(sequelize, 'query')
      .mockResolvedValueOnce([
        {
          id: 1,
          action: 'BAN_USER',
          user: '{"username":"admin","role":"admin"}',
        },
      ])
      .mockResolvedValueOnce([{ total: 12 }]);

    const result = await LogRepository.getLogs({
      userId: 5,
      action: 'BAN',
      from: '2026-01-01',
      to: '2026-01-31',
      page: 2,
      limit: 10,
    });

    expect(querySpy).toHaveBeenCalledTimes(2);
    const firstSql = querySpy.mock.calls[0][0];
    expect(firstSql).toContain("u.role = 'admin'");
    expect(firstSql).toContain('sl.user_id = :userId');
    expect(firstSql).toContain('sl.action LIKE :action');
    expect(firstSql).toContain('sl.created_at >= :from');
    expect(firstSql).toContain('sl.created_at <= :to');

    expect(result).toEqual({
      rows: [{ id: 1, action: 'BAN_USER', user: { username: 'admin', role: 'admin' } }],
      count: 12,
    });
  });

  it('works with base where only and preserves object user field', async () => {
    const querySpy = vi.spyOn(sequelize, 'query')
      .mockResolvedValueOnce([{ id: 2, user: { username: 'root', role: 'admin' } }])
      .mockResolvedValueOnce([{ total: 1 }]);

    const result = await LogRepository.getLogs({ page: 1, limit: 5 });

    const firstSql = querySpy.mock.calls[0][0];
    expect(firstSql).toContain("u.role = 'admin'");
    expect(firstSql).not.toContain('sl.user_id = :userId');
    expect(result).toEqual({ rows: [{ id: 2, user: { username: 'root', role: 'admin' } }], count: 1 });
  });
});
