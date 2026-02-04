const CategoryRepository = require('../../repositories/category.repository');
const LoggingService = require('../../services/logging.service');
const { Op } = require('sequelize');

class UpdateCategoryUseCase {
  static async execute(adminId, id, { name, description }, ip) {
    // 1. Check exists
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw { status: 404, message: 'Category not found' };
    }

    // 2. Validate duplicate name if name changed
    if (name && name !== category.name) {
      const existing = await CategoryRepository.findByName(name);
      if (existing) {
        throw { status: 409, message: 'Category name already exists' };
      }
    }

    // 3. Update
    await CategoryRepository.update(id, { name, description });

    // 4. Log
    await LoggingService.log(
      adminId,
      'UPDATE_CATEGORY',
      ip,
      { categoryId: id, oldName: category.name, newName: name }
    );

    return await CategoryRepository.findById(id);
  }
}

module.exports = UpdateCategoryUseCase;
