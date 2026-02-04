const CategoryRepository = require('../../repositories/category.repository');
const LoggingService = require('../../services/logging.service');

class CreateCategoryUseCase {
  static async execute(adminId, { name, description }, ip) {
    // 1. Validate input
    if (!name || name.trim().length === 0) {
      throw { status: 400, message: 'Category name is required' };
    }

    // 2. Check duplicate
    const existing = await CategoryRepository.findByName(name);
    if (existing) {
      throw { status: 409, message: 'Category name already exists' };
    }

    // 3. Create
    const newCategory = await CategoryRepository.create({ name, description });

    // 4. Log
    await LoggingService.log(
      adminId,
      'CREATE_CATEGORY',
      ip,
      { categoryId: newCategory.id, name: newCategory.name }
    );

    return newCategory;
  }
}

module.exports = CreateCategoryUseCase;
