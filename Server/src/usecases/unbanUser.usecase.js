const UserRepository = require('../repositories/user.repository');
const LoggingService = require('../services/logging.service');

class UnbanUserUseCase {
  static async execute(adminId, userIdToUnban, ip) {
    const user = await UserRepository.findById(userIdToUnban);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    if (user.status === 'active') {
       throw { status: 409, message: 'User is already active' };
    }

    // Update DB
    // Clear banned info
    const updateData = {
      status: 'active',
      banned_reason: null,
      banned_at: null
    };
    await UserRepository.update(userIdToUnban, updateData);

    // Log
    await LoggingService.log(
      adminId,
      'UNBAN_USER',
      ip,
      { targetUserId: userIdToUnban }
    );

    return { message: `User ${user.username} has been unbanned.` };
  }
}

module.exports = UnbanUserUseCase;
