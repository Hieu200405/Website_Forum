const CommentRepository = require('../../../Server/src/repositories/comment.repository');
const Comment = require('../../../Server/src/models/comment.model');

describe('CommentRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('create forwards payload to model', async () => {
    vi.spyOn(Comment, 'create').mockResolvedValue({ id: 1 });

    const data = { content: 'hello', user_id: 1, post_id: 2 };
    const result = await CommentRepository.create(data);

    expect(result).toEqual({ id: 1 });
    expect(Comment.create).toHaveBeenCalledWith(data);
  });

  it('findById delegates to findByPk', async () => {
    vi.spyOn(Comment, 'findByPk').mockResolvedValue({ id: 4 });

    const result = await CommentRepository.findById(4);

    expect(result).toEqual({ id: 4 });
    expect(Comment.findByPk).toHaveBeenCalledWith(4);
  });

  it('findAllByPostId requests active comments with author include', async () => {
    vi.spyOn(Comment, 'findAll').mockResolvedValue([]);

    await CommentRepository.findAllByPostId(55);

    expect(Comment.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { post_id: 55, status: 'active' },
        order: [['created_at', 'ASC']],
      })
    );

    const callArg = Comment.findAll.mock.calls[0][0];
    expect(callArg.include[0]).toEqual(
      expect.objectContaining({ as: 'author', attributes: ['id', 'username', 'role', 'avatar'] })
    );
  });
});
