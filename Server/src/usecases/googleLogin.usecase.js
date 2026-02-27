const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/user.repository');
const LoggingService = require('../services/logging.service');
const jwtConfig = require('../config/jwt');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class GoogleLoginUseCase {
  static async execute(token, ip) {
    // 1. Verify Google Token
    let payload;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch (error) {
        throw { status: 401, message: 'Token Google không hợp lệ hoặc đã hết hạn' };
    }

    const { email, name, picture } = payload;

    // 2. Check if user exists
    let user = await UserRepository.findByEmail(email);

    if (!user) {
      // 3. Create new user if not exists
      // Generate a random long password for social login users since they don't use it
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      
      let usernameBase = name.replace(/\s+/g, '').substring(0, 20); // removing spaces
      if (usernameBase.length < 4) usernameBase += "user";
      
      let finalUsername = usernameBase;
      let counter = 1;
      while (await UserRepository.findByUsername(finalUsername)) {
           finalUsername = `${usernameBase}${counter}`;
           counter++;
      }
      
      const userData = {
          username: finalUsername,
          email: email,
          password: randomPassword, // In repository it will be hashed or raw stored for google
          role: 'user', // Default role
          status: 'active',
          avatar: picture // we can save picture to avatar column directly here!
      };
      
      user = await UserRepository.create(userData);
      await LoggingService.log(user.id, 'REGISTER_GOOGLE', ip);
    } else {
        // If user exists but was banned
        if (user.status !== 'active') {
             throw { status: 403, message: `Tài khoản của bạn đang bị khóa. Nêu thắc mắc xin liên hệ Admin.` };
        }
    }

    // 4. Generate JWT Token
    const jwtPayload = {
      userId: user.id,
      role: user.role
    };

    const accessToken = jwt.sign(jwtPayload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });

    // 5. Log action
    await LoggingService.log(user.id, 'LOGIN_GOOGLE', ip);

    // 6. Return result
    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: picture // we can return google picture
      }
    };
  }
}

module.exports = GoogleLoginUseCase;
