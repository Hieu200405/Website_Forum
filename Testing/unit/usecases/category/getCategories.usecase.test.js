const GetCategoriesUseCase = require('../../../../Server/src/usecases/category/getCategories.usecase');
const CategoryRepository = require('../../../../Server/src/repositories/category.repository');

describe('GetCategoriesUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns repository categories', async () => {
    vi.spyOn(CategoryRepository, 'findAll').mockResolvedValue([{ id: 1, name: 'Tech' }]);

    const result = await GetCategoriesUseCase.execute();

    expect(CategoryRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1, name: 'Tech' }]);
  });
});
