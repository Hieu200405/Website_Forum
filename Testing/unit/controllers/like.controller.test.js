const LikeController = require('../../../Server/src/controllers/like.controller');
const LikePostUseCase = require('../../../Server/src/usecases/like-post.usecase');
const UnlikePostUseCase = require('../../../Server/src/usecases/unlike-post.usecase');
const { createReq, createRes } = require('../helpers/http');

describe('LikeController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('like forwards args and returns 200', async () => {
    vi.spyOn(LikePostUseCase, 'execute').mockResolvedValue({ liked: true });
    const req = createReq({ user: { userId: 1 }, params: { postId: '10' }, app: {} });
    const res = createRes();

    await LikeController.like(req, res);

    expect(LikePostUseCase.execute).toHaveBeenCalledWith(1, '10', '127.0.0.1', req.app);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('unlike maps thrown status and message', async () => {
    vi.spyOn(UnlikePostUseCase, 'execute').mockRejectedValue({ status: 400, message: 'bad' });
    const req = createReq({ user: { userId: 1 }, params: { postId: '10' }, app: {} });
    const res = createRes();

    await LikeController.unlike(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'bad' });
  });

  it('unlike returns 200 on success', async () => {
    vi.spyOn(UnlikePostUseCase, 'execute').mockResolvedValue({ liked: false });
    const req = createReq({ user: { userId: 1 }, params: { postId: '10' }, headers: { 'x-forwarded-for': '9.9.9.9' }, app: {} });
    const res = createRes();

    await LikeController.unlike(req, res);

    expect(UnlikePostUseCase.execute).toHaveBeenCalledWith(1, '10', '9.9.9.9', req.app);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('like maps unknown error to 500', async () => {
    vi.spyOn(LikePostUseCase, 'execute').mockRejectedValue({ message: 'boom' });
    const req = createReq({ user: { userId: 1 }, params: { postId: '10' }, app: {} });
    const res = createRes();

    await LikeController.like(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'boom' });
  });
});
