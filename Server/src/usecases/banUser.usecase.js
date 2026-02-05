const UserRepository = require('../repositories/user.repository');
const LoggingService = require('../services/logging.service');
const ROLES = require('../constants/roles');

class BanUserUseCase {
  static async execute(adminId, userIdToBan, reason, ip) {
    // 1. Validation
    if (!reason) {
      throw { status: 400, message: 'Reason is required to ban a user' };
    }

    const user = await UserRepository.findById(userIdToBan);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    if (user.role === ROLES.ADMIN) {
      throw { status: 403, message: 'Cannot ban an Admin' };
    }

    if (user.status === 'banned') {
       throw { status: 409, message: 'User is already banned' };
    }

    // 2. Update DB
    const updateData = {
      status: 'banned',
      banned_reason: reason,
      banned_at: new Date()
    };
    await UserRepository.update(userIdToBan, updateData);

    // 3. Log
    await LoggingService.log(
      adminId,
      'BAN_USER',
      ip,
      { targetUserId: userIdToBan, reason }
    );

    return { message: `User ${user.username} has been banned.` };
  }
}

module.exports = BanUserUseCase;
