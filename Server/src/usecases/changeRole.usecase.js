const UserRepository = require('../repositories/user.repository');
const LoggingService = require('../services/logging.service');
const ROLES = require('../constants/roles');

class ChangeRoleUseCase {
  /**
   * Thay đổi quyền hạn (Role) của một user
   * @param {number} adminId - ID của người thực hiện (Admin)
   * @param {number} targetUserId - ID của user được đổi role
   * @param {string} newRole - Role mới (USER, MODERATOR, ADMIN)
   * @param {string} ip - IP Address
   */
  static async execute(adminId, targetUserId, newRole, ip) {
    // 1. Validate Input
    const validRoles = Object.values(ROLES);
    const normalizedRole = newRole.toUpperCase();

    if (!validRoles.includes(normalizedRole)) {
      throw { status: 400, message: 'Invalid role. Allowed: USER, MODERATOR, ADMIN' };
    }

    if (!targetUserId) {
      throw { status: 400, message: 'User ID is required' };
    }

    // 2. Validate User Existence
    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    // Không cho phép tự đổi role của chính mình (để tránh admin tự hạ quyền rồi mất access)
    // Tùy nghiệp vụ, ở đây tạm thời cho phép hoặc warn. 
    // Nếu muốn chặn: 
    // if (adminId == targetUserId) throw { status: 400, message: 'Cannot change your own role' };

    // 3. Update Role Logic
    const success = await UserRepository.updateRole(targetUserId, normalizedRole);
    if (!success) {
      throw { status: 500, message: 'Failed to update user role' };
    }

    // 4. Logging
    await LoggingService.log(
      adminId,
      'CHANGE_ROLE',
      ip,
      { 
        targetUserId: parseInt(targetUserId), 
        oldRole: user.role, 
        newRole: normalizedRole 
      },
      'INFO'
    );

    return {
      userId: targetUserId,
      newRole: normalizedRole,
      message: 'User role updated successfully'
    };
  }
}

module.exports = ChangeRoleUseCase;
