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
   * Kiểm tra văn bản bằng LLM (AI) để chống Toxic content tinh vi
   * @param {string} text 
   */
  async aiCheck(text) {
    if (!text || !process.env.GEMINI_API_KEY) {
        console.warn('AI Moderation: Missing text or GEMINI_API_KEY');
        return { isValid: true, reason: 'AI Check Bypassed' };
    }

    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Corrected model name: gemini-1.5-flash is stable and fast
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Phân tích đoạn văn bản sau và cho tôi biết nó có chứa nội dung toxic, thù địch, quấy rối, tục tĩu hay vi phạm tiêu chuẩn cộng đồng không. Chỉ trả về JSON duy nhất: {"isValid": boolean, "reason": "Lý do bằng tiếng Việt, khoảng 10 chữ"}: \n"${text}"`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        
        console.log('AI Moderation Raw Response:', responseText);

        // Clean markdown block if any
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(responseText);
        return {
            isValid: data.isValid !== false,
            reason: data.reason || 'AI Flagged'
        };
    } catch (err) {
        console.error('AI Moderation Critical Error:', err.message);
        if (err.message.includes('403')) {
            console.error('AI Moderation: API Key invalid or permissions denied');
        }
        // Fallback mở cho user nếu AI lỗi
        return { isValid: true, reason: 'AI Error Fallback' };
    }
  }

  /**
   * Kiểm tra văn bản kết hợp Cấm từ (Rule-based) & AI Generative
   * @param {string} text 
   * @returns {Promise<{isValid: boolean, bannedWordsFound: string[], aiReason?: string}>}
   */
  async check(text) {
    if (!text) {
      return { isValid: true, bannedWordsFound: [] };
    }
    
    // 1. Rule-based Fast Check
    const lowerText = text.toLowerCase();
    const bannedWords = await this.loadBannedWords();
    const found = bannedWords.filter(word => lowerText.includes(word));

    if (found.length > 0) {
        return {
            isValid: false,
            bannedWordsFound: found,
            aiReason: 'Rule-based banned words matched'
        };
    }

    // 2. AI Advanced Check
    const aiResult = await this.aiCheck(text);
    return {
      isValid: aiResult.isValid,
      bannedWordsFound: [],
      aiReason: aiResult.isValid ? null : aiResult.reason
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
