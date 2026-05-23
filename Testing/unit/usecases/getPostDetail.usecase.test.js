const PostRepository = require('../../../Server/src/repositories/post.repository');
const CommentRepository = require('../../../Server/src/repositories/comment.repository');
const LikeRepository = require('../../../Server/src/repositories/like.repository');
const SavedPostRepository = require('../../../Server/src/repositories/savedPost.repository');
const Follow = require('../../../Server/src/models/follow.model');
const GetPostDetailUseCase = require('../../../Server/src/usecases/getPostDetail.usecase');

describe('GetPostDetailUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 404 when post not found', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue(null);
    await expect(GetPostDetailUseCase.execute(1, null)).rejects.toMatchObject({ status: 404 });
  });

  it('throws 403 for hidden post when requester not allowed', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({ status: 'hidden', user_id: 2 });
    await expect(GetPostDetailUseCase.execute(1, { userId: 3, role: 'USER' })).rejects.toMatchObject({ status: 403 });
  });

  it('returns formatted detail with like/save/follow flags for authenticated user', async () => {
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({
      id: 1,
      title: 'title',
      content: 'content',
      image_url: 'img',
      status: 'active',
      created_at: '2026-05-23',
      like_count: 4,
      comment_count: 1,
      user_id: 9,
      author: { id: 9, username: 'author', role: 'USER', avatar: 'av', reputation: 100 },
      category: { id: 2, name: 'General' },
    });
    vi.spyOn(CommentRepository, 'findAllByPostId').mockResolvedValue([
      {
        id: 5,
        content: 'c',
        image_url: null,
        created_at: '2026-05-23',
        author: { id: 3, username: 'u', avatar: 'x', role: 'USER' },
      },
    ]);
    vi.spyOn(LikeRepository, 'exists').mockResolvedValue(true);
    vi.spyOn(SavedPostRepository, 'exists').mockResolvedValue(false);
    vi.spyOn(Follow, 'findOne').mockResolvedValue({ id: 1 });

    const result = await GetPostDetailUseCase.execute(1, { userId: 7, role: 'USER' });

    expect(result.isLiked).toBe(true);
    expect(result.author.isFollowing).toBe(true);
  });
});
