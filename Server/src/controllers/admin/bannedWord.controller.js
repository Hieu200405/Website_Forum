const AddBannedWordUseCase = require('../../usecases/bannedWord/addBannedWord.usecase');
const DeleteBannedWordUseCase = require('../../usecases/bannedWord/deleteBannedWord.usecase');
const GetBannedWordsUseCase = require('../../usecases/bannedWord/getBannedWords.usecase');

class BannedWordController {
  
  static async getAll(req, res) {
    try {
      const result = await GetBannedWordsUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async add(req, res) {
    try {
      const adminId = req.user.userId;
      const { word } = req.body;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

      const result = await AddBannedWordUseCase.execute(adminId, word, ip);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const adminId = req.user.userId;
      const { id } = req.params;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

      const result = await DeleteBannedWordUseCase.execute(adminId, id, ip);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
  }
}

module.exports = BannedWordController;
