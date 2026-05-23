const PostController = require('../../../Server/src/controllers/post.controller');
const GetPostsUseCase = require('../../../Server/src/usecases/getPosts.usecase');
const CreatePostUseCase = require('../../../Server/src/usecases/createPost.usecase');
const SavePostUseCase = require('../../../Server/src/usecases/savePost.usecase');
const PostRepository = require('../../../Server/src/repositories/post.repository');
const Post = require('../../../Server/src/models/post.model');
const { createReq, createRes } = require('../helpers/http');

describe('PostController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('create maps pending status to 202', async () => {
    vi.spyOn(CreatePostUseCase, 'execute').mockResolvedValue({ status: 'pending' });
    const req = createReq({
      user: { userId: 1 },
      body: { title: 't', content: 'c', categoryId: 2 },
      headers: { 'x-forwarded-for': '4.4.4.4' },
    });
    const res = createRes();

    await PostController.create(req, res);

    expect(CreatePostUseCase.execute).toHaveBeenCalledWith(1, { title: 't', content: 'c', categoryId: 2 }, '4.4.4.4');
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('getPosts forwards query + optional userId', async () => {
    vi.spyOn(GetPostsUseCase, 'execute').mockResolvedValue({ success: true });
    const req = createReq({ query: { page: '2', limit: '5' }, user: { userId: 3 } });
    const res = createRes();

    await PostController.getPosts(req, res);

    expect(GetPostsUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ page: '2', limit: '5', userId: 3 })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('save forwards user/post/ip and returns 200', async () => {
    vi.spyOn(SavePostUseCase, 'execute').mockResolvedValue({ ok: true });
    const req = createReq({ user: { userId: 7 }, params: { postId: '10' } });
    const res = createRes();

    await PostController.save(req, res);

    expect(SavePostUseCase.execute).toHaveBeenCalledWith(7, '10', '127.0.0.1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('delete returns 403 when not owner and not elevated role', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({ id: 10, user_id: 9 });
    const deleteSpy = vi.spyOn(PostRepository, 'delete').mockResolvedValue(true);
    const req = createReq({ user: { userId: 1, role: 'user' }, params: { id: '10' } });
    const res = createRes();

    await PostController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('update returns 404 when post missing', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue(null);
    const updateSpy = vi.spyOn(Post, 'update').mockResolvedValue([1]);
    const req = createReq({ user: { userId: 1 }, params: { id: '10' }, body: { title: 'new' } });
    const res = createRes();

    await PostController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(updateSpy).not.toHaveBeenCalled();
  });
});
