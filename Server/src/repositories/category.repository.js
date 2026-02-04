const Category = require('../models/category.model');

class CategoryRepository {
  async findAll() {
    return await Category.findAll({
      attributes: ['id', 'name', 'description']
    });
  }

  async findById(id) {
    return await Category.findByPk(id);
  }

  async findByName(name) {
    return await Category.findOne({ where: { name } });
  }

  async create(data) {
    return await Category.create(data);
  }

  async update(id, data) {
    const [updated] = await Category.update(data, { where: { id } });
    return updated > 0;
  }

  async delete(id) {
    return await Category.destroy({ where: { id } });
  }

  async countPostsByCategory(id) {
    // TODO: Implement actual count when Post model is available
    // return await Post.count({ where: { categoryId: id } });
    return 0;
  }
}

module.exports = new CategoryRepository();
