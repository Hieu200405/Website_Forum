const AdminController = require('../../../Server/src/controllers/admin.controller');
const BanUserUseCase = require('../../../Server/src/usecases/banUser.usecase');
const UnbanUserUseCase = require('../../../Server/src/usecases/unbanUser.usecase');
const UserRepository = require('../../../Server/src/repositories/user.repository');
const ReportRepository = require('../../../Server/src/repositories/report.repository');
const GetAdminStatsUseCase = require('../../../Server/src/usecases/getAdminStats.usecase');
const { createReq, createRes } = require('../helpers/http');

describe('AdminController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('banUser passes params and returns 200', async () => {
    vi.spyOn(BanUserUseCase, 'execute').mockResolvedValue({ message: 'ok' });
    const req = createReq({ user: { userId: 1 }, params: { id: '2' }, body: { reason: 'spam' }, headers: { 'x-forwarded-for': '1.1.1.1' } });
    const res = createRes();

    await AdminController.banUser(req, res);

    expect(BanUserUseCase.execute).toHaveBeenCalledWith(1, '2', 'spam', '1.1.1.1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('unbanUser maps thrown status/message', async () => {
    vi.spyOn(UnbanUserUseCase, 'execute').mockRejectedValue({ status: 404, message: 'not found' });
    const req = createReq({ user: { userId: 1 }, params: { id: '2' } });
    const res = createRes();

    await AdminController.unbanUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('getUsers returns paginated response', async () => {
    vi.spyOn(UserRepository, 'findAll').mockResolvedValue({ count: 21, rows: [{ id: 1 }] });
    const req = createReq({ query: { page: '2', limit: '10' } });
    const res = createRes();

    await AdminController.getUsers(req, res);

    expect(UserRepository.findAll).toHaveBeenCalledWith({ limit: 10, offset: 10 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('getReports passes status and paging', async () => {
    vi.spyOn(ReportRepository, 'findAll').mockResolvedValue({ count: 1, rows: [{ id: 1 }] });
    const req = createReq({ query: { page: '1', limit: '20', status: 'pending' } });
    const res = createRes();

    await AdminController.getReports(req, res);

    expect(ReportRepository.findAll).toHaveBeenCalledWith({ limit: 20, offset: 0, status: 'pending' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getStats returns usecase data', async () => {
    vi.spyOn(GetAdminStatsUseCase, 'execute').mockResolvedValue({ overview: {} });
    const req = createReq();
    const res = createRes();

    await AdminController.getStats(req, res);

    expect(GetAdminStatsUseCase.execute).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('unbanUser returns 200 on success', async () => {
    vi.spyOn(UnbanUserUseCase, 'execute').mockResolvedValue({ message: 'ok' });
    const req = createReq({ user: { userId: 1 }, params: { id: '2' } });
    const res = createRes();

    await AdminController.unbanUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('banUser maps unknown error to 500', async () => {
    vi.spyOn(BanUserUseCase, 'execute').mockRejectedValue({ message: 'x' });
    const req = createReq({ user: { userId: 1 }, params: { id: '2' }, body: { reason: 'spam' } });
    const res = createRes();

    await AdminController.banUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('getUsers maps repository errors to 500', async () => {
    vi.spyOn(UserRepository, 'findAll').mockRejectedValue(new Error('boom'));
    const req = createReq({ query: {} });
    const res = createRes();

    await AdminController.getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('getReports uses default status and paging', async () => {
    vi.spyOn(ReportRepository, 'findAll').mockResolvedValue({ count: 0, rows: [] });
    const req = createReq({ query: {} });
    const res = createRes();

    await AdminController.getReports(req, res);

    expect(ReportRepository.findAll).toHaveBeenCalledWith({ limit: 20, offset: 0, status: 'pending' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getStats maps usecase errors to 500', async () => {
    vi.spyOn(GetAdminStatsUseCase, 'execute').mockRejectedValue(new Error('boom'));
    const req = createReq();
    const res = createRes();

    await AdminController.getStats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
