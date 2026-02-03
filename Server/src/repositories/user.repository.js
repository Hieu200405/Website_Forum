const User = require('../models/user.model');

class UserRepository {
  /**
   * Tìm user theo email
   * @param {string} email 
   * @returns {Promise<Model|null>}
   */
  async findByEmail(email) {
    try {
      return await User.findOne({ where: { email } });
    } catch (error) {
      console.error('UserRepository Error:', error);
      throw error;
    }
  }

  /**
   * Tìm user theo ID
   * @param {number} id 
   * @returns {Promise<Model|null>}
   */
  async findById(id) {
    try {
      return await User.findByPk(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserRepository();
