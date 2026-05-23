const FollowRepository = require('../../../Server/src/repositories/follow.repository');
const Follow = require('../../../Server/src/models/follow.model');

describe('FollowRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('follow creates relation row', async () => {
    vi.spyOn(Follow, 'create').mockResolvedValue({ follower_id: 1, following_id: 2 });

    await FollowRepository.follow(1, 2);

    expect(Follow.create).toHaveBeenCalledWith({ follower_id: 1, following_id: 2 });
  });

  it('unfollow destroys relation by composite where', async () => {
    vi.spyOn(Follow, 'destroy').mockResolvedValue(1);

    await FollowRepository.unfollow(1, 2);

    expect(Follow.destroy).toHaveBeenCalledWith({ where: { follower_id: 1, following_id: 2 } });
  });

  it('isFollowing returns true when count > 0', async () => {
    vi.spyOn(Follow, 'count').mockResolvedValue(1);

    const result = await FollowRepository.isFollowing(1, 2);

    expect(result).toBe(true);
  });

  it('isFollowing returns false when count = 0', async () => {
    vi.spyOn(Follow, 'count').mockResolvedValue(0);

    const result = await FollowRepository.isFollowing(1, 2);

    expect(result).toBe(false);
  });

  it('getFollowers includes Follower alias', async () => {
    vi.spyOn(Follow, 'findAll').mockResolvedValue([]);

    await FollowRepository.getFollowers(5);

    const arg = Follow.findAll.mock.calls[0][0];
    expect(arg.where).toEqual({ following_id: 5 });
    expect(arg.include[0]).toEqual(expect.objectContaining({ as: 'Follower' }));
  });

  it('getFollowing includes FollowingUser alias', async () => {
    vi.spyOn(Follow, 'findAll').mockResolvedValue([]);

    await FollowRepository.getFollowing(5);

    const arg = Follow.findAll.mock.calls[0][0];
    expect(arg.where).toEqual({ follower_id: 5 });
    expect(arg.include[0]).toEqual(expect.objectContaining({ as: 'FollowingUser' }));
  });
});
