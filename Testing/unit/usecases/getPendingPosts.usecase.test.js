const GetPendingPostsUseCase = require('../../../Server/src/usecases/getPendingPosts.usecase');
const PostRepository = require('../../../Server/src/repositories/post.repository');

describe('GetPendingPostsUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('passes parsed paging and returns pagination payload', async () => {
    vi.spyOn(PostRepository, 'findAll').mockResolvedValue({ rows: [{ id: 1 }], count: 12 });

    const result = await GetPendingPostsUseCase.execute({ page: '2', limit: '5' });

    expect(PostRepository.findAll).toHaveBeenCalledWith({ status: 'pending', page: 2, limit: 5 });
    expect(result).toEqual({ posts: [{ id: 1 }], total: 12, page: 2, totalPages: 3 });
  });

  it('uses defaults when params missing', async () => {
    vi.spyOn(PostRepository, 'findAll').mockResolvedValue({ rows: [], count: 0 });

    const result = await GetPendingPostsUseCase.execute();

    expect(PostRepository.findAll).toHaveBeenCalledWith({ status: 'pending', page: 1, limit: 10 });
    expect(result).toEqual({ posts: [], total: 0, page: 1, totalPages: 0 });
  });
});
