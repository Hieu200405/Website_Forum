const BannedWordRepository = require('../../repositories/bannedWord.repository');
const LoggingService = require('../../services/logging.service');

class AddBannedWordUseCase {
  static async execute(adminId, word, ip) {
    if (!word || !word.trim()) {
      throw { status: 400, message: 'Từ khóa không được để trống' };
    }

    const normalizedWord = word.trim().toLowerCase();

    // Check duplicate
    const existing = await BannedWordRepository.findByWord(normalizedWord);
    if (existing) {
      throw { status: 409, message: 'Từ khóa này đã tồn tại trong danh sách cấm' };
    }

    // Save
    const newBannedWord = await BannedWordRepository.create(normalizedWord);

    // Log
    await LoggingService.log(
      adminId,
      'ADD_BANNED_WORD',
      ip,
      { word: normalizedWord, id: newBannedWord.id }
    );

    // Invalidate Moderation Cache
    const ModerationService = require('../../services/moderation.service');
    ModerationService.lastUpdate = 0;

    return newBannedWord;
  }
}

module.exports = AddBannedWordUseCase;
