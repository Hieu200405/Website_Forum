const SavedPostRepository = require('../../../Server/src/repositories/savedPost.repository');
const SavedPost = require('../../../Server/src/models/savedPost.model');

describe('SavedPostRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exists returns true when saved post found', async () => {
    vi.spyOn(SavedPost, 'findOne').mockResolvedValue({ id: 1 });

    const result = await SavedPostRepository.exists(1, 2);

    expect(result).toBe(true);
    expect(SavedPost.findOne).toHaveBeenCalledWith({ where: { user_id: 1, post_id: 2 } });
  });

  it('exists returns false when saved post missing', async () => {
    vi.spyOn(SavedPost, 'findOne').mockResolvedValue(null);

    const result = await SavedPostRepository.exists(1, 2);

    expect(result).toBe(false);
  });

  it('create delegates to model create', async () => {
    vi.spyOn(SavedPost, 'create').mockResolvedValue({ id: 5 });

    await SavedPostRepository.create(7, 8);

    expect(SavedPost.create).toHaveBeenCalledWith({ user_id: 7, post_id: 8 });
  });

  it('delete delegates to destroy by composite key', async () => {
    vi.spyOn(SavedPost, 'destroy').mockResolvedValue(1);

    await SavedPostRepository.delete(7, 8);

    expect(SavedPost.destroy).toHaveBeenCalledWith({ where: { user_id: 7, post_id: 8 } });
  });
});
