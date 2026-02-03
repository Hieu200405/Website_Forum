const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/user.repository');
const LoggingService = require('../services/logging.service');
const jwtConfig = require('../config/jwt');

class LoginUseCase {
  /**
   * Xử lý logic đăng nhập
   * @param {string} email 
   * @param {string} password 
   * @param {string} ip - IP Address của client
   * @returns {Promise<object>}
   */
  static async execute(email, password, ip) {
    // 1. Tìm user theo email
    const user = await UserRepository.findByEmail(email);

    // 2. Kiểm tra user tồn tại
    if (!user) {
      // Về mặt bảo mật, không nên trả về "Email không tồn tại"
      throw { status: 401, message: 'Email hoặc mật khẩu không chính xác' };
    }

    // 3. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw { status: 401, message: 'Email hoặc mật khẩu không chính xác' };
    }

    // 4. Tạo JWT Token
    // Payload chứa user identity và role
    const payload = {
      userId: user.id,
      role: user.role
    };

    const accessToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });

    // 5. Ghi log hành động LOGIN
    await LoggingService.log(user.id, 'LOGIN', ip);

    // 6. Trả về kết quả
    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
  }
}

module.exports = LoginUseCase;
