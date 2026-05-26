const LogController = require('../../../Server/src/controllers/log.controller');
const ViewLogsUseCase = require('../../../Server/src/usecases/viewLogs.usecase');
const { createReq, createRes } = require('../helpers/http');

describe('LogController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getLogs returns 200 with usecase data', async () => {
    vi.spyOn(ViewLogsUseCase, 'execute').mockResolvedValue({ logs: [] });
    const req = createReq({ query: { page: '1' } });
    const res = createRes();

    await LogController.getLogs(req, res);

    expect(ViewLogsUseCase.execute).toHaveBeenCalledWith({ page: '1' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getLogs maps errors to 500', async () => {
    vi.spyOn(ViewLogsUseCase, 'execute').mockRejectedValue(new Error('boom'));
    const req = createReq({ query: {} });
    const res = createRes();

    await LogController.getLogs(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
