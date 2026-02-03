/**
 * Role Middleware
 * Kiểm tra quyền hạn của user
 * @param {string[]} roles - Danh sách các role được phép truy cập
 */
const roleMiddleware = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    }

    next();
  };
};

module.exports = roleMiddleware;
