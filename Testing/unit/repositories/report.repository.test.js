const ReportRepository = require('../../../Server/src/repositories/report.repository');
const Report = require('../../../Server/src/models/report.model');

describe('ReportRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exists returns true when report exists', async () => {
    vi.spyOn(Report, 'findOne').mockResolvedValue({ id: 1 });

    const result = await ReportRepository.exists(2, 3);

    expect(result).toBe(true);
    expect(Report.findOne).toHaveBeenCalledWith({ where: { user_id: 2, post_id: 3 } });
  });

  it('countByPostId delegates count query', async () => {
    vi.spyOn(Report, 'count').mockResolvedValue(4);

    const count = await ReportRepository.countByPostId(10);

    expect(count).toBe(4);
    expect(Report.count).toHaveBeenCalledWith({ where: { post_id: 10 } });
  });

  it('countByStatus delegates status filter', async () => {
    vi.spyOn(Report, 'count').mockResolvedValue(2);

    await ReportRepository.countByStatus('pending');

    expect(Report.count).toHaveBeenCalledWith({ where: { status: 'pending' } });
  });

  it('updateStatusByPostId delegates update call', async () => {
    vi.spyOn(Report, 'update').mockResolvedValue([3]);

    const result = await ReportRepository.updateStatusByPostId(20, 'reviewed');

    expect(result).toEqual([3]);
    expect(Report.update).toHaveBeenCalledWith({ status: 'reviewed' }, { where: { post_id: 20 } });
  });

  it('findAll builds include list and status where', async () => {
    vi.spyOn(Report, 'findAndCountAll').mockResolvedValue({ rows: [], count: 0 });

    await ReportRepository.findAll({ limit: 10, offset: 0, status: 'pending' });

    expect(Report.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'pending' },
        limit: 10,
        offset: 0,
        order: [['created_at', 'DESC']],
      })
    );

    const include = Report.findAndCountAll.mock.calls[0][0].include;
    expect(include[0]).toEqual(expect.objectContaining({ as: 'reporter' }));
    expect(include[1]).toEqual(expect.objectContaining({ as: 'post' }));
  });
});
