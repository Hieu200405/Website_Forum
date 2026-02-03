const RegisterUseCase = require('../usecases/register.usecase');
const LoginUseCase = require('../usecases/login.usecase');

/**
 * Auth Controller - Điều hướng các request đến UseCase tương ứng
 */

/**
 * Xử lý đăng ký tài khoản
 */
exports.register = async (req, res) => {
  try {
    const userData = req.body;
    // Lấy IP client
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const result = await RegisterUseCase.execute(userData, ip);
    
    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: result,
    });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Lỗi server';
    
    res.status(status).json({
      success: false,
      message,
    });
  }
};

/**
 * Xử lý đăng nhập
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Lấy IP client
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

    const result = await LoginUseCase.execute(email, password, ip);
    
    res.status(200).json(result);
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Lỗi hệ thống';
    
    res.status(status).json({
      message, // Theo yêu cầu bảo mật: "Email hoặc mật khẩu không chính xác" (từ UseCase)
    });
  }
};
