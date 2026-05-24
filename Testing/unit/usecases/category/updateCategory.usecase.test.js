const UpdateCategoryUseCase = require('../../../../Server/src/usecases/category/updateCategory.usecase');
const CategoryRepository = require('../../../../Server/src/repositories/category.repository');
const LoggingService = require('../../../../Server/src/services/logging.service');

describe('UpdateCategoryUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 404 when category not found', async () => {
    vi.spyOn(CategoryRepository, 'findById').mockResolvedValue(null);

    await expect(UpdateCategoryUseCase.execute(1, 2, { name: 'x' }, '1.1.1.1')).rejects.toMatchObject({ status: 404 });
  });

  it('throws 409 when new name collides', async () => {
    vi.spyOn(CategoryRepository, 'findById').mockResolvedValue({ id: 2, name: 'Old' });
    vi.spyOn(CategoryRepository, 'findByName').mockResolvedValue({ id: 3, name: 'New' });

    await expect(UpdateCategoryUseCase.execute(1, 2, { name: 'New' }, '1.1.1.1')).rejects.toMatchObject({ status: 409 });
  });

  it('updates category and writes log', async () => {
    vi.spyOn(CategoryRepository, 'findById')
      .mockResolvedValueOnce({ id: 2, name: 'Old' })
      .mockResolvedValueOnce({ id: 2, name: 'New', description: 'd2' });
    vi.spyOn(CategoryRepository, 'findByName').mockResolvedValue(null);
    vi.spyOn(CategoryRepository, 'update').mockResolvedValue(true);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await UpdateCategoryUseCase.execute(1, 2, { name: 'New', description: 'd2' }, '1.1.1.1');

    expect(CategoryRepository.update).toHaveBeenCalledWith(2, { name: 'New', description: 'd2' });
    expect(LoggingService.log).toHaveBeenCalledWith(1, 'UPDATE_CATEGORY', '1.1.1.1', { categoryId: 2, oldName: 'Old', newName: 'New' });
    expect(result).toEqual({ id: 2, name: 'New', description: 'd2' });
  });
});
