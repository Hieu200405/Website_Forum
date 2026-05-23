const ReportController = require('../../../Server/src/controllers/report.controller');
const ReportPostUseCase = require('../../../Server/src/usecases/report-post.usecase');
const { createReq, createRes } = require('../helpers/http');

describe('ReportController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('report prefers params.postId over body.postId', async () => {
    vi.spyOn(ReportPostUseCase, 'execute').mockResolvedValue({ message: 'ok' });
    const req = createReq({
      user: { userId: 1 },
      params: { postId: '10' },
      body: { postId: '99', reason: 'spam' },
      headers: { 'x-forwarded-for': '2.2.2.2' },
    });
    const res = createRes();

    await ReportController.report(req, res);

    expect(ReportPostUseCase.execute).toHaveBeenCalledWith(1, '10', 'spam', '2.2.2.2');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('report maps thrown status/message', async () => {
    vi.spyOn(ReportPostUseCase, 'execute').mockRejectedValue({ status: 400, message: 'bad report' });
    const req = createReq({ user: { userId: 1 }, body: { postId: '99', reason: 'x' }, params: {} });
    const res = createRes();

    await ReportController.report(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'bad report' });
  });
});
