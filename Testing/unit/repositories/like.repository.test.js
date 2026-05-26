const LikeRepository = require('../../../Server/src/repositories/like.repository');
const Like = require('../../../Server/src/models/like.model');

describe('LikeRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exists returns true when like found', async () => {
    vi.spyOn(Like, 'findOne').mockResolvedValue({ id: 1 });

    const result = await LikeRepository.exists(1, 2);

    expect(Like.findOne).toHaveBeenCalledWith({ where: { user_id: 1, post_id: 2 } });
    expect(result).toBe(true);
  });

  it('exists returns false when no like', async () => {
    vi.spyOn(Like, 'findOne').mockResolvedValue(null);

    const result = await LikeRepository.exists(1, 2);

    expect(result).toBe(false);
  });

  it('create delegates to model create', async () => {
    vi.spyOn(Like, 'create').mockResolvedValue({ id: 10 });

    const result = await LikeRepository.create(1, 2);

    expect(Like.create).toHaveBeenCalledWith({ user_id: 1, post_id: 2 });
    expect(result).toEqual({ id: 10 });
  });

  it('delete returns true when row deleted and false otherwise', async () => {
    vi.spyOn(Like, 'destroy').mockResolvedValueOnce(1).mockResolvedValueOnce(0);

    expect(await LikeRepository.delete(1, 2)).toBe(true);
    expect(await LikeRepository.delete(1, 2)).toBe(false);
  });

  it('countByPostId delegates to model count', async () => {
    vi.spyOn(Like, 'count').mockResolvedValue(7);

    const result = await LikeRepository.countByPostId(3);

    expect(Like.count).toHaveBeenCalledWith({ where: { post_id: 3 } });
    expect(result).toBe(7);
  });
});
