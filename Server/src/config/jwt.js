require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'default_secret_key_please_change',
  expiresIn: '4h', // Token hết hạn sau 4 giờ theo yêu cầu
};
