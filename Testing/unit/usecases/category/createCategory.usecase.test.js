const CreateCategoryUseCase = require('../../../../Server/src/usecases/category/createCategory.usecase');
const CategoryRepository = require('../../../../Server/src/repositories/category.repository');
const LoggingService = require('../../../../Server/src/services/logging.service');

describe('CreateCategoryUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 400 when name missing', async () => {
    await expect(CreateCategoryUseCase.execute(1, { name: '   ' }, '1.1.1.1')).rejects.toMatchObject({ status: 400 });
  });

  it('throws 409 on duplicate name', async () => {
    vi.spyOn(CategoryRepository, 'findByName').mockResolvedValue({ id: 2 });

    await expect(CreateCategoryUseCase.execute(1, { name: 'Tech' }, '1.1.1.1')).rejects.toMatchObject({ status: 409 });
  });

  it('creates category and writes log', async () => {
    vi.spyOn(CategoryRepository, 'findByName').mockResolvedValue(null);
    vi.spyOn(CategoryRepository, 'create').mockResolvedValue({ id: 3, name: 'Tech' });
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await CreateCategoryUseCase.execute(1, { name: 'Tech', description: 'd' }, '1.1.1.1');

    expect(CategoryRepository.create).toHaveBeenCalledWith({ name: 'Tech', description: 'd' });
    expect(LoggingService.log).toHaveBeenCalledWith(1, 'CREATE_CATEGORY', '1.1.1.1', { categoryId: 3, name: 'Tech' });
    expect(result).toEqual({ id: 3, name: 'Tech' });
  });
});
