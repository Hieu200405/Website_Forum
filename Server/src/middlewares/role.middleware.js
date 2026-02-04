const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    // 1. Kiểm tra header Auth đã được verify chưa (req.user phải tồn tại từ Auth Middleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    // 2. Lấy role của user hiện tại
    const userRole = req.user.role;

    // 3. Chuẩn hóa role sang chữ hoa để so sánh chính xác (nếu cần)
    const normalizedUserRole = userRole ? userRole.toUpperCase() : '';
    const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());

    // 4. Kiểm tra role có nằm trong danh sách cho phép không
    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource' });
    }

    // 5. Hợp lệ -> Next
    next();
  };
};

module.exports = roleMiddleware;
