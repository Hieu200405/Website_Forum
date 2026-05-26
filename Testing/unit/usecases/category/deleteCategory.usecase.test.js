const DeleteCategoryUseCase = require('../../../../Server/src/usecases/category/deleteCategory.usecase');
const CategoryRepository = require('../../../../Server/src/repositories/category.repository');
const LoggingService = require('../../../../Server/src/services/logging.service');

describe('DeleteCategoryUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 404 when category not found', async () => {
    vi.spyOn(CategoryRepository, 'findById').mockResolvedValue(null);

    await expect(DeleteCategoryUseCase.execute(1, 2, '1.1.1.1')).rejects.toMatchObject({ status: 404 });
  });

  it('throws 400 when category has posts', async () => {
    vi.spyOn(CategoryRepository, 'findById').mockResolvedValue({ id: 2, name: 'Tech' });
    vi.spyOn(CategoryRepository, 'countPostsByCategory').mockResolvedValue(3);

    await expect(DeleteCategoryUseCase.execute(1, 2, '1.1.1.1')).rejects.toMatchObject({ status: 400 });
  });

  it('deletes category and writes log', async () => {
    vi.spyOn(CategoryRepository, 'findById').mockResolvedValue({ id: 2, name: 'Tech' });
    vi.spyOn(CategoryRepository, 'countPostsByCategory').mockResolvedValue(0);
    vi.spyOn(CategoryRepository, 'delete').mockResolvedValue(true);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await DeleteCategoryUseCase.execute(1, 2, '1.1.1.1');

    expect(CategoryRepository.delete).toHaveBeenCalledWith(2);
    expect(LoggingService.log).toHaveBeenCalledWith(1, 'DELETE_CATEGORY', '1.1.1.1', { categoryId: 2, name: 'Tech' });
    expect(result).toEqual({ message: 'Category deleted successfully' });
  });
});
