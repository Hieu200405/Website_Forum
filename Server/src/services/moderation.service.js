const PostRepository = require('../repositories/post.repository');
const BannedWordRepository = require('../repositories/bannedWord.repository');

class ModerationService {
  constructor() {
    this.cache = [];
    this.lastUpdate = 0;
    this.CACHE_TSL = 60000; // 1 phút refresh cache 1 lần
  }

  async loadBannedWords() {
    const now = Date.now();
    // Cache expiry check
    if (now - this.lastUpdate > this.CACHE_TSL || this.cache.length === 0) {
      const words = await BannedWordRepository.findAllWords(); 
      // Normalize cache to lowercase
      this.cache = words.map(w => w.toLowerCase());
      this.lastUpdate = now;
    }
    return this.cache;
  }

  /**
   * Kiểm tra văn bản có chứa từ cấm không
   * @param {string} text 
   * @returns {Promise<{isValid: boolean, bannedWordsFound: string[]}>}
   */
  async check(text) {
    if (!text) {
      return { isValid: true, bannedWordsFound: [] };
    }
    
    const lowerText = text.toLowerCase();
    const bannedWords = await this.loadBannedWords();
    
    // Tìm tất cả các từ cấm xuất hiện trong text
    const found = bannedWords.filter(word => lowerText.includes(word));

    return {
      isValid: found.length === 0,
      bannedWordsFound: found
    };
  }

  /**
   * Ẩn bài viết nếu vượt quá số lượng report cho phép
   * @param {number} postId 
   */
  async hidePostIfExceededReports(postId) {
    const { REPORT_THRESHOLD } = require('../config/constants');
    const ReportRepository = require('../repositories/report.repository'); // Lazy load avoid circular ref
    const LoggingService = require('../services/logging.service');
    
    // 1. Get count
    const count = await ReportRepository.countByPostId(postId);

    // 2. Check threshold
    if (count > REPORT_THRESHOLD) {
      const post = await PostRepository.findById(postId);
      // Chỉ ẩn nếu bài đang active
      if (post && post.status === 'active') {
        await PostRepository.updateStatus(postId, 'hidden');
        await LoggingService.log(null, 'AUTO_HIDE_POST', 'SYSTEM', { postId, reportCount: count });
        return true;
      }
    }
    return false;
  }
}

module.exports = new ModerationService();
