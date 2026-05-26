const path = require('path');
const { createRequire } = require('module');

const serverRequire = createRequire(path.resolve(__dirname, '../../../Server/package.json'));
const { OAuth2Client } = serverRequire('google-auth-library');
const jwt = serverRequire('jsonwebtoken');

const UserRepository = require('../../../Server/src/repositories/user.repository');
const LoggingService = require('../../../Server/src/services/logging.service');
const GoogleLoginUseCase = require('../../../Server/src/usecases/googleLogin.usecase');

describe('GoogleLoginUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 401 when google token invalid', async () => {
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockRejectedValue(new Error('invalid token'));

    await expect(GoogleLoginUseCase.execute('bad-token', '1.1.1.1')).rejects.toMatchObject({
      status: 401,
      message: 'Token Google không hợp lệ hoặc đã hết hạn',
    });
  });

  it('throws 403 when existing user is banned', async () => {
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ email: 'banned@x.com', name: 'Banned User', picture: 'pic' }),
    });
    vi.spyOn(UserRepository, 'findByEmail').mockResolvedValue({ id: 7, role: 'user', status: 'banned' });

    await expect(GoogleLoginUseCase.execute('good-token', '1.1.1.1')).rejects.toMatchObject({
      status: 403,
    });
  });

  it('returns token for existing active user and logs LOGIN_GOOGLE', async () => {
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ email: 'active@x.com', name: 'Active User', picture: 'avatar-url' }),
    });
    vi.spyOn(UserRepository, 'findByEmail').mockResolvedValue({
      id: 9,
      username: 'active',
      role: 'user',
      status: 'active',
    });
    vi.spyOn(jwt, 'sign').mockReturnValue('google-jwt');
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await GoogleLoginUseCase.execute('good-token', '2.2.2.2');

    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: 9, role: 'user' },
      expect.any(String),
      expect.objectContaining({ expiresIn: expect.any(String) })
    );
    expect(LoggingService.log).toHaveBeenCalledWith(9, 'LOGIN_GOOGLE', '2.2.2.2');
    expect(result).toEqual({
      accessToken: 'google-jwt',
      user: {
        id: 9,
        username: 'active',
        role: 'user',
        avatar: 'avatar-url',
      },
    });
  });

  it('creates new user when not exists then returns token', async () => {
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ email: 'new@x.com', name: 'New User', picture: 'new-avatar' }),
    });

    vi.spyOn(UserRepository, 'findByEmail').mockResolvedValue(null);
    vi.spyOn(UserRepository, 'findByUsername').mockResolvedValue(null);
    vi.spyOn(UserRepository, 'create').mockResolvedValue({
      id: 15,
      username: 'NewUser',
      role: 'user',
      status: 'active',
    });

    vi.spyOn(jwt, 'sign').mockReturnValue('new-user-jwt');
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await GoogleLoginUseCase.execute('new-token', '3.3.3.3');

    expect(UserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@x.com',
        role: 'user',
        status: 'active',
        avatar: 'new-avatar',
      })
    );

    expect(LoggingService.log).toHaveBeenNthCalledWith(1, 15, 'REGISTER_GOOGLE', '3.3.3.3');
    expect(LoggingService.log).toHaveBeenNthCalledWith(2, 15, 'LOGIN_GOOGLE', '3.3.3.3');

    expect(result.accessToken).toBe('new-user-jwt');
    expect(result.user.id).toBe(15);
  });
});
