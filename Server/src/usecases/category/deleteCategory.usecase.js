const CategoryRepository = require('../../repositories/category.repository');
const LoggingService = require('../../services/logging.service');

class DeleteCategoryUseCase {
  static async execute(adminId, id, ip) {
    // 1. Check exists
    const category = await CategoryRepository.findById(id);
    if (!category) {
      throw { status: 404, message: 'Category not found' };
    }

    // 2. Check dependencies (Posts)
    const postCount = await CategoryRepository.countPostsByCategory(id);
    if (postCount > 0) {
      throw { status: 400, message: 'Cannot delete category containing posts' };
    }

    // 3. Delete
    await CategoryRepository.delete(id);

    // 4. Log
    await LoggingService.log(
      adminId,
      'DELETE_CATEGORY',
      ip,
      { categoryId: id, name: category.name }
    );

    return { message: 'Category deleted successfully' };
  }
}

module.exports = DeleteCategoryUseCase;
