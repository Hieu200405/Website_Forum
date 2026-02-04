const CategoryRepository = require('../../repositories/category.repository');

class GetCategoriesUseCase {
  static async execute() {
    return await CategoryRepository.findAll();
  }
}

module.exports = GetCategoriesUseCase;
