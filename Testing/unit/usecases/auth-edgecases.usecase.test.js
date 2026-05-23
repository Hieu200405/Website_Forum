const path = require('path');
const { createRequire } = require('module');

const serverRequire = createRequire(path.resolve(__dirname, '../../../Server/package.json'));
const { OAuth2Client } = serverRequire('google-auth-library');
const jwt = serverRequire('jsonwebtoken');
const bcrypt = serverRequire('bcryptjs');

const UserRepository = require('../../../Server/src/repositories/user.repository');
const LoggingService = require('../../../Server/src/services/logging.service');
const LoginUseCase = require('../../../Server/src/usecases/login.usecase');
const GoogleLoginUseCase = require('../../../Server/src/usecases/googleLogin.usecase');

describe('Auth usecase edge cases', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('uses role from found user when signing login jwt', async () => {
    vi.spyOn(UserRepository, 'findByEmail').mockResolvedValue({
      id: 2,
      username: 'moduser',
      role: 'moderator',
      password: 'hash',
    });
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    const signSpy = vi.spyOn(jwt, 'sign').mockReturnValue('role-token');
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    await LoginUseCase.execute('mod@x.com', 'pw', '4.4.4.4');

    expect(signSpy).toHaveBeenCalledWith(
      { userId: 2, role: 'moderator' },
      expect.any(String),
      expect.objectContaining({ expiresIn: expect.any(String) })
    );
  });

  it('resolves username collision by appending increment suffix for google signup', async () => {
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({ email: 'short@x.com', name: 'Al', picture: 'avatar' }),
    });

    vi.spyOn(UserRepository, 'findByEmail').mockResolvedValue(null);
    vi.spyOn(UserRepository, 'findByUsername')
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce(null);

    vi.spyOn(UserRepository, 'create').mockResolvedValue({
      id: 21,
      username: 'Aluser1',
      role: 'user',
      status: 'active',
    });

    vi.spyOn(jwt, 'sign').mockReturnValue('collision-token');
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    await GoogleLoginUseCase.execute('collision-token-input', '5.5.5.5');

    expect(UserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'Aluser1',
      })
    );
  });
});
