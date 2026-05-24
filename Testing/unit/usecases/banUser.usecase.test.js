const BanUserUseCase = require('../../../Server/src/usecases/banUser.usecase');
const UserRepository = require('../../../Server/src/repositories/user.repository');
const LoggingService = require('../../../Server/src/services/logging.service');
const ROLES = require('../../../Server/src/constants/roles');

describe('BanUserUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 400 when reason missing', async () => {
    await expect(BanUserUseCase.execute(1, 2, '', '1.1.1.1')).rejects.toMatchObject({ status: 400 });
  });

  it('throws 404 when target user not found', async () => {
    vi.spyOn(UserRepository, 'findById').mockResolvedValue(null);

    await expect(BanUserUseCase.execute(1, 2, 'spam', '1.1.1.1')).rejects.toMatchObject({ status: 404 });
  });

  it('throws 403 when target is admin', async () => {
    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: 2, role: ROLES.ADMIN, status: 'active' });

    await expect(BanUserUseCase.execute(1, 2, 'spam', '1.1.1.1')).rejects.toMatchObject({ status: 403 });
  });

  it('throws 409 when target already banned', async () => {
    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: 2, role: ROLES.USER, status: 'banned' });

    await expect(BanUserUseCase.execute(1, 2, 'spam', '1.1.1.1')).rejects.toMatchObject({ status: 409 });
  });

  it('updates user and writes ban log', async () => {
    vi.spyOn(UserRepository, 'findById').mockResolvedValue({ id: 2, username: 'u2', role: ROLES.USER, status: 'active' });
    vi.spyOn(UserRepository, 'update').mockResolvedValue(true);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await BanUserUseCase.execute(1, 2, 'spam', '1.1.1.1');

    expect(UserRepository.update).toHaveBeenCalledWith(2, expect.objectContaining({
      status: 'banned',
      banned_reason: 'spam',
    }));
    expect(LoggingService.log).toHaveBeenCalledWith(1, 'BAN_USER', '1.1.1.1', expect.objectContaining({ targetUserId: 2, reason: 'spam' }));
    expect(result).toEqual({ message: 'User u2 has been banned.' });
  });
});
