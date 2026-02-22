const User = require('../models/user.model');

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async findByUsername(username) {
    return await User.findOne({ where: { username } });
  }

  async create(userData) {
    return await User.create(userData);
  }

  async findById(id) {
    return await User.findByPk(id);
  }

  /**
   * Cập nhật thông tin user
   * @param {number} id 
   * @param {object} updateData 
   */
  async update(id, updateData) {
    const [updated] = await User.update(updateData, { where: { id } });
    return updated > 0;
  }

  async findAll({ limit = 20, offset = 0, order = [['created_at', 'DESC']] } = {}) {
    return await User.findAndCountAll({
      limit,
      offset,
      order,
      attributes: { exclude: ['password'] } // Security: Don't return passwords
    });
  }
}

module.exports = new UserRepository();
