const BannedWord = require('../models/bannedWord.model');

class BannedWordRepository {
  /**
   * Tạo từ cấm mới
   * @param {string} word 
   * @returns {Promise<BannedWord>}
   */
  async create(word) {
    return await BannedWord.create({ word });
  }

  /**
   * Tìm từ cấm theo word
   * @param {string} word 
   */
  async findByWord(word) {
    return await BannedWord.findOne({ where: { word } });
  }

  /**
   * Tìm theo ID
   * @param {number} id 
   */
  async findById(id) {
    return await BannedWord.findByPk(id);
  }

  /**
   * Xóa từ cấm
   * @param {number} id 
   */
  async delete(id) {
    return await BannedWord.destroy({ where: { id } });
  }

  /**
   * Lấy tất cả từ cấm (Full Models)
   */
  async findAll() {
    return await BannedWord.findAll({
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Lấy danh sách từ cấm dạng mảng String (Để Service dùng cho nhanh)
   * @returns {Promise<string[]>}
   */
  async findAllWords() {
    const results = await BannedWord.findAll({
      attributes: ['word']
    });
    return results.map(item => item.word);
  }
}

module.exports = new BannedWordRepository();
