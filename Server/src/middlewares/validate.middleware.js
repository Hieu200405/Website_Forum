const { validationResult } = require('express-validator');

/**
 * Middleware kiểm tra kết quả validation từ express-validator
 * Trả về 400 nếu có lỗi validate
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đầu vào không hợp lệ',
      errors: errors.array()
    });
  }
  next();
};

module.exports = validate;
