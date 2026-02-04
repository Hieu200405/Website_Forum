class ModerationService {
  constructor() {
    // List cứng demo, trong thực tế sẽ load từ DB hoặc file json
    this.bannedWords = ['badword', 'vi phạm', 'cấm', 'spam'];
  }

  /**
   * Kiểm tra nội dung có chứa từ cấm hay không
   * @param {string} text - Nội dung cần kiểm tra
   * @returns {boolean} - True nếu vi phạm
   */
  check(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    
    return this.bannedWords.some(word => lowerText.includes(word.toLowerCase()));
  }

  /**
   * Kiểm tra cả tiêu đề và nội dung
   * @param {string} title 
   * @param {string} content 
   * @returns {boolean}
   */
  checkContent(title, content) {
    return this.check(title) || this.check(content);
  }
}

module.exports = new ModerationService();
