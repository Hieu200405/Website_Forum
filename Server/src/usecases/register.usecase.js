const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const LoggingService = require('../services/logging.service');
const ROLES = require('../constants/roles');

/**
 * Register UseCase - Xử lý logic đăng ký tài khoản
 */
class RegisterUseCase {
  /**
   * Thực hiện đăng ký tài khoản mới
   * @param {object} userData - Dữ liệu đăng ký {username, email, password}
   * @returns {Promise<object>} - Kết quả đăng ký
   */
  static async execute(userData, ip = 'UNKNOWN') {
    const { username, email, password } = userData;

    // 1. Validate input
    if (!username || !email || !password) {
      throw {
        status: 400,
        message: 'Username, email và password là bắt buộc',
      };
    }

    // Validate username length
    if (username.length < 4 || username.length > 30) {
      throw {
        status: 400,
        message: 'Username phải có độ dài từ 4-30 ký tự',
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw {
        status: 400,
        message: 'Email không hợp lệ',
      };
    }

    // Validate password length
    if (password.length < 8) {
      throw {
        status: 400,
        message: 'Password phải có ít nhất 8 ký tự',
      };
    }

    // 2. Kiểm tra trùng username
    const existingUsername = await User.findOne({
      where: { username },
    });

    if (existingUsername) {
      throw {
        status: 409,
        message: 'Username đã tồn tại',
      };
    }

    // 3. Kiểm tra trùng email
    const existingEmail = await User.findOne({
      where: { email },
    });

    if (existingEmail) {
      throw {
        status: 409,
        message: 'Email đã tồn tại',
      };
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Lưu user vào database
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: ROLES.USER, // Role mặc định
    });

    // 6. Ghi log hành động REGISTER
    // 6. Ghi log hành động REGISTER
    await LoggingService.log(newUser.id, 'REGISTER', ip);

    // 7. Return response (không trả về password)
    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      created_at: newUser.created_at,
    };
  }
}

module.exports = RegisterUseCase;
