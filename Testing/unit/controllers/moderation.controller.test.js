const ModerationController = require('../../../Server/src/controllers/moderation.controller');
const ModeratePostUseCase = require('../../../Server/src/usecases/moderatePost.usecase');
const GetModerationStatsUseCase = require('../../../Server/src/usecases/getModerationStats.usecase');
const GetPendingPostsUseCase = require('../../../Server/src/usecases/getPendingPosts.usecase');
const { createReq, createRes } = require('../helpers/http');

describe('ModerationController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('moderatePost forwards params/body/ip/app and returns 200', async () => {
    vi.spyOn(ModeratePostUseCase, 'execute').mockResolvedValue({ ok: true });
    const req = createReq({
      user: { userId: 5, role: 'moderator' },
      params: { postId: '11' },
      body: { action: 'hide', reason: 'spam' },
      headers: { 'x-forwarded-for': '9.9.9.9' },
      app: {},
    });
    const res = createRes();

    await ModerationController.moderatePost(req, res);

    expect(ModeratePostUseCase.execute).toHaveBeenCalledWith(5, 'moderator', '11', 'hide', 'spam', '9.9.9.9', req.app);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('moderatePost maps thrown status/message', async () => {
    vi.spyOn(ModeratePostUseCase, 'execute').mockRejectedValue({ status: 403, message: 'forbidden' });
    const req = createReq({ user: { userId: 5, role: 'user' }, params: { postId: '11' }, body: { action: 'hide' } });
    const res = createRes();

    await ModerationController.moderatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'forbidden' });
  });

  it('getStats maps internal errors to 500', async () => {
    vi.spyOn(GetModerationStatsUseCase, 'execute').mockRejectedValue(new Error('boom'));
    const req = createReq();
    const res = createRes();

    await ModerationController.getStats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('getPendingPosts forwards paging query and returns 200', async () => {
    vi.spyOn(GetPendingPostsUseCase, 'execute').mockResolvedValue({ rows: [] });
    const req = createReq({ query: { page: '2', limit: '5' } });
    const res = createRes();

    await ModerationController.getPendingPosts(req, res);

    expect(GetPendingPostsUseCase.execute).toHaveBeenCalledWith({ page: '2', limit: '5' });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
