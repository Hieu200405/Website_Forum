const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const util = require('util');

// Promisify jwt.verify để dùng với async/await
const verifyToken = util.promisify(jwt.verify);

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Đọc header Authorization
    const authHeader = req.headers['authorization'];

    // 2. Kiểm tra header tồn tại và đúng format "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Lấy token từ header
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 3. Verify token (Dùng async/await)
    // Nếu token sai hoặc hết hạn, hàm này sẽ throw error -> nhảy xuống verify catch
    const decoded = await verifyToken(token, jwtConfig.secret);

    // 4. Token hợp lệ: Gán user info vào request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    // Check Banned Status (Bổ sung security)
    const User = require('../models/user.model');
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
    }
    
    if (user.status === 'banned') {
        const reason = user.banned_reason || 'Vi phạm điều khoản';
        return res.status(403).json({ message: `Tài khoản của bạn đã bị khóa. Lý do: ${reason}` });
    }
    
    // Refresh role from DB (Để đảm bảo role mới nhất)
    req.user.role = user.role;

    // 5. Chuyển tiếp request
    next();

  } catch (error) {
    // 6. Xử lý lỗi: Thiếu token, Token sai, Token hết hạn
    // Không trả lỗi chi tiết, chỉ trả 401 Unauthorized
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
