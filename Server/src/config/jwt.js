require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'your_fallback_secret_key', // Secret key đọc từ biến môi trường
  expiresIn: '24h', // Thời gian hết hạn token
};
