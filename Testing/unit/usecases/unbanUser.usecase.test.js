const UnbanUserUseCase = require('../../../Server/src/usecases/unbanUser.usecase');
const UserRepository = require('../../../Server/src/repositories/user.repository');
const LoggingService = require('../../../Server/src/services/logging.service');

describe('UnbanUserUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 404 when target user not found', async () => {
    vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);

    await expect(UnbanUserUseCase.execute(1, 2, '1.1.1.1')).rejects.toMatchObject({ status: 404 });
  });

  it('throws 409 when user already active', async () => {
    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: 2, status: 'active' });

    await expect(UnbanUserUseCase.execute(1, 2, '1.1.1.1')).rejects.toMatchObject({ status: 409 });
  });

  it('updates user and writes unban log', async () => {
    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: 2, username: 'u2', status: 'banned' });
    vi.spyOn(UserRepository, 'update').mockResolvedValue(true);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await UnbanUserUseCase.execute(1, 2, '1.1.1.1');

    expect(UserRepository.update).toHaveBeenCalledWith(2, {
      status: 'active',
      banned_reason: null,
      banned_at: null,
    });
    expect(LoggingService.log).toHaveBeenCalledWith(1, 'UNBAN_USER', '1.1.1.1', { targetUserId: 2 });
    expect(result).toEqual({ message: 'User u2 has been unbanned.' });
  });
});
