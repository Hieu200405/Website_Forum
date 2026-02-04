const CreateCategoryUseCase = require('../usecases/category/createCategory.usecase');
const GetCategoriesUseCase = require('../usecases/category/getCategories.usecase');
const UpdateCategoryUseCase = require('../usecases/category/updateCategory.usecase');
const DeleteCategoryUseCase = require('../usecases/category/deleteCategory.usecase');

class CategoryController {
  
  static async getAll(req, res) {
    try {
      const categories = await GetCategoriesUseCase.execute();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req, res) {
    try {
      const adminId = req.user.userId;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      const result = await CreateCategoryUseCase.execute(adminId, req.body, ip);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const adminId = req.user.userId;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      const result = await UpdateCategoryUseCase.execute(adminId, req.params.id, req.body, ip);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const adminId = req.user.userId;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      const result = await DeleteCategoryUseCase.execute(adminId, req.params.id, ip);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }
}

module.exports = CategoryController;
