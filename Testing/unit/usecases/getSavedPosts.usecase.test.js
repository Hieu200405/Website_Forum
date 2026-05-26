const GetSavedPostsUseCase = require('../../../Server/src/usecases/getSavedPosts.usecase');
const SavedPost = require('../../../Server/src/models/savedPost.model');
const Like = require('../../../Server/src/models/like.model');
const Comment = require('../../../Server/src/models/comment.model');

describe('GetSavedPostsUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('maps saved posts with counts and liked flag', async () => {
    vi.spyOn(SavedPost, 'findAndCountAll').mockResolvedValue({
      count: 1,
      rows: [
        {
          Post: {
            id: 5,
            title: 'Post 5',
            image_url: 'img',
            created_at: '2026-01-01',
            category: { name: 'Tech' },
            author: { id: 9, username: 'u9' },
          },
        },
      ],
    });
    vi.spyOn(Like, 'count').mockResolvedValue(3);
    vi.spyOn(Comment, 'count').mockResolvedValue(2);
    vi.spyOn(Like, 'findOne').mockResolvedValue({ id: 1 });

    const result = await GetSavedPostsUseCase.execute(10, { page: 2, limit: 5 });

    expect(SavedPost.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { user_id: 10 },
      limit: 5,
      offset: 5,
    }));
    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
    expect(result.total).toBe(1);
    expect(result.data[0]).toEqual(expect.objectContaining({
      id: 5,
      likeCount: 3,
      commentCount: 2,
      category: 'Tech',
      author: { id: 9, username: 'u9' },
      isSaved: true,
      isLiked: true,
    }));
  });

  it('uses fallback category/author and isLiked false', async () => {
    vi.spyOn(SavedPost, 'findAndCountAll').mockResolvedValue({
      count: 1,
      rows: [
        {
          Post: {
            id: 7,
            title: 'Post 7',
            image_url: null,
            created_at: '2026-01-02',
            category: null,
            author: null,
          },
        },
      ],
    });
    vi.spyOn(Like, 'count').mockResolvedValue(0);
    vi.spyOn(Comment, 'count').mockResolvedValue(0);
    vi.spyOn(Like, 'findOne').mockResolvedValue(null);

    const result = await GetSavedPostsUseCase.execute(11, { page: 1, limit: 10 });

    expect(result.data[0].category).toBe('Thảo luận');
    expect(result.data[0].author).toEqual({ id: undefined, username: 'Ẩn danh' });
    expect(result.data[0].isLiked).toBe(false);
  });
});
