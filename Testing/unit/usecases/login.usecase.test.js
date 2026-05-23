const path = require('path');
const { createRequire } = require('module');

const serverRequire = createRequire(path.resolve(__dirname, '../../../Server/package.json'));
const bcrypt = serverRequire('bcryptjs');
const jwt = serverRequire('jsonwebtoken');

const UserRepository = require('../../../Server/src/repositories/user.repository');
const LoggingService = require('../../../Server/src/services/logging.service');
const LoginUseCase = require('../../../Server/src/usecases/login.usecase');

describe('LoginUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 401 when user not found', async () => {
    vi.spyOn(UserRepository, 'findByEmail').mockResolvedValue(null);

    await expect(LoginUseCase.execute('none@example.com', 'x', '1.1.1.1')).rejects.toMatchObject({
      status: 401,
      message: 'Email hoặc mật khẩu không chính xác',
    });
  });

  it('throws 401 when password mismatches', async () => {
    vi.spyOn(UserRepository, 'findByEmail').mockResolvedValue({
      id: 1,
      username: 'tester',
      role: 'user',
      password: 'hash',
    });
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await expect(LoginUseCase.execute('ok@example.com', 'bad', '2.2.2.2')).rejects.toMatchObject({
      status: 401,
      message: 'Email hoặc mật khẩu không chính xác',
    });
  });

  it('returns token and user payload when credentials valid', async () => {
    vi.spyOn(UserRepository, 'findByEmail').mockResolvedValue({
      id: 1,
      username: 'tester',
      role: 'user',
      password: 'hash',
    });
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    vi.spyOn(jwt, 'sign').mockReturnValue('signed-token');
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await LoginUseCase.execute('ok@example.com', 'pw', '2.2.2.2');

    expect(result).toEqual({
      accessToken: 'signed-token',
      user: {
        id: 1,
        username: 'tester',
        role: 'user',
      },
    });

    expect(jwt.sign).toHaveBeenCalled();
    expect(LoggingService.log).toHaveBeenCalledWith(1, 'LOGIN', '2.2.2.2');
  });
});
