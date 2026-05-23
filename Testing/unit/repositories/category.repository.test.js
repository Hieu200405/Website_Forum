const CategoryRepository = require('../../../Server/src/repositories/category.repository');
const Category = require('../../../Server/src/models/category.model');

describe('CategoryRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('findAll requests expected attributes', async () => {
    vi.spyOn(Category, 'findAll').mockResolvedValue([]);

    await CategoryRepository.findAll();

    expect(Category.findAll).toHaveBeenCalledWith({
      attributes: ['id', 'name', 'description'],
    });
  });

  it('findById delegates to findByPk', async () => {
    vi.spyOn(Category, 'findByPk').mockResolvedValue({ id: 1 });

    const result = await CategoryRepository.findById(1);

    expect(result).toEqual({ id: 1 });
    expect(Category.findByPk).toHaveBeenCalledWith(1);
  });

  it('findByName queries by name', async () => {
    vi.spyOn(Category, 'findOne').mockResolvedValue({ id: 2 });

    await CategoryRepository.findByName('Tech');

    expect(Category.findOne).toHaveBeenCalledWith({ where: { name: 'Tech' } });
  });

  it('update returns true when row affected', async () => {
    vi.spyOn(Category, 'update').mockResolvedValue([1]);

    const ok = await CategoryRepository.update(2, { name: 'News' });

    expect(ok).toBe(true);
    expect(Category.update).toHaveBeenCalledWith({ name: 'News' }, { where: { id: 2 } });
  });

  it('update returns false when row not affected', async () => {
    vi.spyOn(Category, 'update').mockResolvedValue([0]);

    const ok = await CategoryRepository.update(99, { name: 'Nope' });

    expect(ok).toBe(false);
  });

  it('countPostsByCategory returns zero placeholder', async () => {
    const count = await CategoryRepository.countPostsByCategory(10);
    expect(count).toBe(0);
  });
});
