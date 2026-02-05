const BannedWordRepository = require('../../repositories/bannedWord.repository');
const LoggingService = require('../../services/logging.service');

class DeleteBannedWordUseCase {
  static async execute(adminId, id, ip) {
    // Check exist
    const bannedWord = await BannedWordRepository.findById(id);
    if (!bannedWord) {
      throw { status: 404, message: 'Từ khóa không tồn tại' };
    }

    // Delete
    await BannedWordRepository.delete(id);

    // Log
    await LoggingService.log(
      adminId,
      'DELETE_BANNED_WORD',
      ip,
      { word: bannedWord.word, id }
    );

    return { message: 'Xóa từ cấm thành công' };
  }
}

module.exports = DeleteBannedWordUseCase;
