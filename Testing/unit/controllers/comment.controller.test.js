const CommentController = require('../../../Server/src/controllers/comment.controller');
const CreateCommentUseCase = require('../../../Server/src/usecases/createComment.usecase');
const GetCommentsByPostUseCase = require('../../../Server/src/usecases/getCommentsByPost.usecase');
const ReplyCommentUseCase = require('../../../Server/src/usecases/replyComment.usecase');
const Comment = require('../../../Server/src/models/comment.model');
const CommentLike = require('../../../Server/src/models/commentLike.model');
const Post = require('../../../Server/src/models/post.model');
const { createReq, createRes } = require('../helpers/http');

describe('CommentController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('commentOnPost calls usecase with parentId null and returns 201', async () => {
    vi.spyOn(CreateCommentUseCase, 'execute').mockResolvedValue({ id: 1 });
    const req = createReq({
      user: { userId: 2 },
      params: { postId: '10' },
      body: { content: 'hi' },
      headers: { 'x-forwarded-for': '6.6.6.6' },
      app: {},
    });
    const res = createRes();

    await CommentController.commentOnPost(req, res);

    expect(CreateCommentUseCase.execute).toHaveBeenCalledWith(
      2,
      { postId: '10', content: 'hi', parentId: null },
      '6.6.6.6',
      req.app
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('reply uses socket ip fallback and returns 201', async () => {
    vi.spyOn(ReplyCommentUseCase, 'execute').mockResolvedValue({ id: 2 });
    const req = createReq({ user: { userId: 2 }, body: { content: 'x' }, app: {} });
    const res = createRes();

    await CommentController.reply(req, res);

    expect(ReplyCommentUseCase.execute).toHaveBeenCalledWith(2, { content: 'x' }, '127.0.0.1', req.app);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('getByPost maps success to 200', async () => {
    vi.spyOn(GetCommentsByPostUseCase, 'execute').mockResolvedValue([]);
    const req = createReq({ params: { postId: '7' } });
    const res = createRes();

    await CommentController.getByPost(req, res);

    expect(GetCommentsByPostUseCase.execute).toHaveBeenCalledWith('7');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('likeComment returns 404 when comment missing', async () => {
    vi.spyOn(Comment, 'findByPk').mockResolvedValue(null);
    const req = createReq({ user: { userId: 1 }, params: { id: '12' } });
    const res = createRes();

    await CommentController.likeComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('unlikeComment returns liked false and current likeCount', async () => {
    vi.spyOn(CommentLike, 'destroy').mockResolvedValue(1);
    vi.spyOn(CommentLike, 'count').mockResolvedValue(3);
    const req = createReq({ user: { userId: 1 }, params: { id: '12' } });
    const res = createRes();

    await CommentController.unlikeComment(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ liked: false, likeCount: 3 }));
  });

  it('deleteComment returns 403 when user has no permission', async () => {
    vi.spyOn(Comment, 'findByPk').mockResolvedValue({ user_id: 9, post_id: 4, destroy: vi.fn() });
    vi.spyOn(Post, 'findByPk').mockResolvedValue({ user_id: 8 });
    const req = createReq({ user: { userId: 1, role: 'user' }, params: { id: '10' } });
    const res = createRes();

    await CommentController.deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
