const GetAdminStatsUseCase = require('../../../Server/src/usecases/getAdminStats.usecase');
const sequelize = require('../../../Server/src/config/database');
const User = require('../../../Server/src/models/user.model');
const Post = require('../../../Server/src/models/post.model');
const Comment = require('../../../Server/src/models/comment.model');
const Like = require('../../../Server/src/models/like.model');

describe('GetAdminStatsUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns aggregated overview, charts, and top posters', async () => {
    vi.spyOn(User, 'count')
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(7);
    vi.spyOn(Post, 'count')
      .mockResolvedValueOnce(200)
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(8);
    vi.spyOn(Comment, 'count').mockResolvedValue(300);
    vi.spyOn(Like, 'count').mockResolvedValue(400);

    vi.spyOn(sequelize, 'query')
      .mockResolvedValueOnce([{ date: '2026-05-01', count: 3 }])
      .mockResolvedValueOnce([{ date: '2026-05-01', count: 5 }])
      .mockResolvedValueOnce([{ category: 'Tech', count: 10 }])
      .mockResolvedValueOnce([{ dow: 2, count: 7 }])
      .mockResolvedValueOnce([{ date: '2026-05-20', count: 9 }])
      .mockResolvedValueOnce([{ id: 1, username: 'top', postCount: 20 }]);

    const result = await GetAdminStatsUseCase.execute();

    expect(User.count).toHaveBeenCalledTimes(2);
    expect(Post.count).toHaveBeenCalledTimes(3);
    expect(Comment.count).toHaveBeenCalledWith({ where: { status: 'active' } });
    expect(Like.count).toHaveBeenCalledTimes(1);
    expect(sequelize.query).toHaveBeenCalledTimes(6);

    expect(result.overview).toEqual({
      totalUsers: 100,
      totalPosts: 200,
      totalComments: 300,
      totalLikes: 400,
      pendingPosts: 12,
      bannedUsers: 7,
      hiddenPosts: 8,
      activePostsRate: 90,
    });
    expect(result.charts.usersByDay).toEqual([{ date: '2026-05-01', count: 3 }]);
    expect(result.topPosters).toEqual([{ id: 1, username: 'top', postCount: 20 }]);
  });

  it('returns activePostsRate 100 when no posts', async () => {
    vi.spyOn(User, 'count')
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    vi.spyOn(Post, 'count')
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    vi.spyOn(Comment, 'count').mockResolvedValue(0);
    vi.spyOn(Like, 'count').mockResolvedValue(0);

    vi.spyOn(sequelize, 'query')
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await GetAdminStatsUseCase.execute();

    expect(result.overview.activePostsRate).toBe(100);
  });
});
