const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    // Bearer <token>
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }

    jwt.verify(token, jwtConfig.secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Token đã hết hạn hoặc không hợp lệ' });
      }
      req.user = decoded; // Lưu thông tin user vào request
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi xác thực hệ thống' });
  }
};

module.exports = authMiddleware;
