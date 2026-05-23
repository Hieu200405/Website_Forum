const CategoryController = require('../../../Server/src/controllers/category.controller');
const CreateCategoryUseCase = require('../../../Server/src/usecases/category/createCategory.usecase');
const GetCategoriesUseCase = require('../../../Server/src/usecases/category/getCategories.usecase');
const UpdateCategoryUseCase = require('../../../Server/src/usecases/category/updateCategory.usecase');
const DeleteCategoryUseCase = require('../../../Server/src/usecases/category/deleteCategory.usecase');
const { createReq, createRes } = require('../helpers/http');

describe('CategoryController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getAll returns 200 with categories', async () => {
    vi.spyOn(GetCategoriesUseCase, 'execute').mockResolvedValue([{ id: 1 }]);
    const req = createReq();
    const res = createRes();

    await CategoryController.getAll(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 1 }] });
  });

  it('create passes admin/body/ip and returns 201', async () => {
    vi.spyOn(CreateCategoryUseCase, 'execute').mockResolvedValue({ id: 2 });
    const req = createReq({ user: { userId: 9 }, body: { name: 'Tech' }, headers: { 'x-forwarded-for': '3.3.3.3' } });
    const res = createRes();

    await CategoryController.create(req, res);

    expect(CreateCategoryUseCase.execute).toHaveBeenCalledWith(9, { name: 'Tech' }, '3.3.3.3');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('update maps thrown status/message', async () => {
    vi.spyOn(UpdateCategoryUseCase, 'execute').mockRejectedValue({ status: 400, message: 'bad data' });
    const req = createReq({ user: { userId: 1 }, params: { id: '5' }, body: { name: '' } });
    const res = createRes();

    await CategoryController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'bad data' });
  });

  it('delete returns 200 with usecase message', async () => {
    vi.spyOn(DeleteCategoryUseCase, 'execute').mockResolvedValue({ message: 'deleted' });
    const req = createReq({ user: { userId: 1 }, params: { id: '5' } });
    const res = createRes();

    await CategoryController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'deleted' });
  });
});
