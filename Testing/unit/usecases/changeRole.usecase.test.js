const ChangeRoleUseCase = require('../../../Server/src/usecases/changeRole.usecase');
const UserRepository = require('../../../Server/src/repositories/user.repository');
const LoggingService = require('../../../Server/src/services/logging.service');

describe('ChangeRoleUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 400 for invalid role', async () => {
    await expect(ChangeRoleUseCase.execute(1, 2, 'bad-role', '1.1.1.1')).rejects.toMatchObject({ status: 400 });
  });

  it('throws 400 for missing target user id', async () => {
    await expect(ChangeRoleUseCase.execute(1, null, 'USER', '1.1.1.1')).rejects.toMatchObject({ status: 400 });
  });

  it('throws 404 when user not found', async () => {
    vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);

    await expect(ChangeRoleUseCase.execute(1, 2, 'USER', '1.1.1.1')).rejects.toMatchObject({ status: 404 });
  });

  it('throws 500 when repository update fails', async () => {
    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: 2, role: 'USER' });
    UserRepository.updateRole = vi.fn().mockResolvedValue(false);

    await expect(ChangeRoleUseCase.execute(1, 2, 'moderator', '1.1.1.1')).rejects.toMatchObject({ status: 500 });
  });

  it('updates role and logs change', async () => {
    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: 2, role: 'USER' });
    UserRepository.updateRole = vi.fn().mockResolvedValue(true);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await ChangeRoleUseCase.execute(1, 2, 'moderator', '1.1.1.1');

    expect(UserRepository.updateRole).toHaveBeenCalledWith(2, 'MODERATOR');
    expect(LoggingService.log).toHaveBeenCalledWith(
      1,
      'CHANGE_ROLE',
      '1.1.1.1',
      { targetUserId: 2, oldRole: 'USER', newRole: 'MODERATOR' },
      'INFO'
    );
    expect(result).toEqual({
      userId: 2,
      newRole: 'MODERATOR',
      message: 'User role updated successfully',
    });
  });
});
