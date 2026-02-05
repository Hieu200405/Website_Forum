const BannedWordRepository = require('../../repositories/bannedWord.repository');

class GetBannedWordsUseCase {
  static async execute() {
    return await BannedWordRepository.findAll();
  }
}

module.exports = GetBannedWordsUseCase;
