const GetCommentsByPostUseCase = require('../../../Server/src/usecases/getCommentsByPost.usecase');
const CommentRepository = require('../../../Server/src/repositories/comment.repository');

describe('GetCommentsByPostUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('maps comments with author payload', async () => {
    vi.spyOn(CommentRepository, 'findAllByPostId').mockResolvedValue([
      {
        id: 1,
        content: 'c1',
        image_url: 'img',
        created_at: '2026-01-01',
        parent_id: null,
        author: { id: 9, username: 'u9', role: 'MODERATOR' },
      },
    ]);

    const result = await GetCommentsByPostUseCase.execute(10);

    expect(CommentRepository.findAllByPostId).toHaveBeenCalledWith(10);
    expect(result).toEqual([
      {
        id: 1,
        content: 'c1',
        imageUrl: 'img',
        createdAt: '2026-01-01',
        parent_id: null,
        author: { id: 9, username: 'u9', role: 'MODERATOR' },
      },
    ]);
  });

  it('maps anonymous author fallback', async () => {
    vi.spyOn(CommentRepository, 'findAllByPostId').mockResolvedValue([
      { id: 2, content: 'c2', image_url: null, created_at: '2026-01-02', parent_id: 1, author: null },
    ]);

    const result = await GetCommentsByPostUseCase.execute(11);

    expect(result[0].author).toEqual({ id: null, username: 'Người dùng ẩn danh', role: 'user' });
  });
});
