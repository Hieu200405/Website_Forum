const sequelize = require('../../../Server/src/config/database');
const PostRepository = require('../../../Server/src/repositories/post.repository');
const Post = require('../../../Server/src/models/post.model');
const Comment = require('../../../Server/src/models/comment.model');
const Like = require('../../../Server/src/models/like.model');
const Report = require('../../../Server/src/models/report.model');

describe('PostRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('countByStatus delegates count query', async () => {
    vi.spyOn(Post, 'count').mockResolvedValue(3);

    const count = await PostRepository.countByStatus('active');

    expect(count).toBe(3);
    expect(Post.count).toHaveBeenCalledWith({ where: { status: 'active' } });
  });

  it('findAll uses default newest order and paging', async () => {
    vi.spyOn(Post, 'findAndCountAll').mockResolvedValue({ rows: [], count: 0 });

    await PostRepository.findAll();

    expect(Post.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        limit: 10,
        offset: 0,
        order: [['created_at', 'DESC']],
      })
    );
  });

  it('findAll uses mostLiked order and filters', async () => {
    vi.spyOn(Post, 'findAndCountAll').mockResolvedValue({ rows: [], count: 0 });

    await PostRepository.findAll({ status: 'active', categoryId: 4, page: 2, limit: 5, sortBy: 'mostLiked' });

    expect(Post.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'active', category_id: 4 },
        limit: 5,
        offset: 5,
        order: [['like_count', 'DESC'], ['created_at', 'DESC']],
      })
    );
  });

  it('updateStatus returns true when update affects rows', async () => {
    vi.spyOn(Post, 'update').mockResolvedValue([1]);

    const ok = await PostRepository.updateStatus(7, 'hidden');

    expect(ok).toBe(true);
    expect(Post.update).toHaveBeenCalledWith({ status: 'hidden' }, { where: { id: 7 } });
  });

  it('updateModerationStatus excludes hide_reason when null', async () => {
    vi.spyOn(Post, 'update').mockResolvedValue([1]);

    await PostRepository.updateModerationStatus(7, 'active', null);

    expect(Post.update).toHaveBeenCalledWith({ status: 'active' }, { where: { id: 7 } });
  });

  it('updateModerationStatus includes hide_reason when provided', async () => {
    vi.spyOn(Post, 'update').mockResolvedValue([1]);

    await PostRepository.updateModerationStatus(7, 'hidden', 'spam');

    expect(Post.update).toHaveBeenCalledWith({ status: 'hidden', hide_reason: 'spam' }, { where: { id: 7 } });
  });

  it('increase and decrease counters delegate increment/decrement', async () => {
    vi.spyOn(Post, 'increment').mockResolvedValue(undefined);
    vi.spyOn(Post, 'decrement').mockResolvedValue(undefined);

    await PostRepository.increaseLikeCount(1);
    await PostRepository.increaseCommentCount(1);
    await PostRepository.decreaseLikeCount(1);

    expect(Post.increment).toHaveBeenCalledWith('like_count', { where: { id: 1 } });
    expect(Post.increment).toHaveBeenCalledWith('comment_count', { where: { id: 1 } });
    expect(Post.decrement).toHaveBeenCalledWith('like_count', { where: { id: 1 } });
  });

  it('delete commits transaction when all operations succeed', async () => {
    const tx = { commit: vi.fn().mockResolvedValue(undefined), rollback: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(sequelize, 'transaction').mockResolvedValue(tx);
    vi.spyOn(Report, 'destroy').mockResolvedValue(1);
    vi.spyOn(Like, 'destroy').mockResolvedValue(1);
    vi.spyOn(Comment, 'update').mockResolvedValue([1]);
    vi.spyOn(Comment, 'destroy').mockResolvedValue(1);
    vi.spyOn(Post, 'destroy').mockResolvedValue(1);

    const result = await PostRepository.delete(20);

    expect(result).toBe(true);
    expect(tx.commit).toHaveBeenCalled();
    expect(tx.rollback).not.toHaveBeenCalled();
  });

  it('delete rolls back when operation throws', async () => {
    const tx = { commit: vi.fn().mockResolvedValue(undefined), rollback: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(sequelize, 'transaction').mockResolvedValue(tx);
    vi.spyOn(Report, 'destroy').mockRejectedValue(new Error('db fail'));

    await expect(PostRepository.delete(20)).rejects.toThrow('db fail');
    expect(tx.rollback).toHaveBeenCalled();
  });

  it('getPostsWithSort queries rows and count', async () => {
    const querySpy = vi.spyOn(sequelize, 'query')
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([{ total: 1 }]);

    const result = await PostRepository.getPostsWithSort({ page: 1, limit: 10, sort: 'newest', userId: 1 });

    expect(result).toEqual({ rows: [{ id: 1 }], count: 1 });
    expect(querySpy).toHaveBeenCalledTimes(2);
    expect(querySpy.mock.calls[0][0]).toContain('FROM posts p');
    expect(querySpy.mock.calls[1][0]).toContain('SELECT COUNT(*) as total FROM posts p');
  });
});
