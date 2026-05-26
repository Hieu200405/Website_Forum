const path = require('path');
const { createRequire } = require('module');

const serverRequire = createRequire(path.resolve(__dirname, '../../../Server/package.json'));
const bcrypt = serverRequire('bcryptjs');

const User = require('../../../Server/src/models/user.model');
const LoggingService = require('../../../Server/src/services/logging.service');
const RegisterUseCase = require('../../../Server/src/usecases/register.usecase');

describe('RegisterUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 400 when required fields missing', async () => {
    await expect(RegisterUseCase.execute({ username: '', email: '', password: '' }, '1.1.1.1')).rejects.toMatchObject({
      status: 400,
    });
  });

  it('throws 400 when username length less than 4', async () => {
    await expect(RegisterUseCase.execute({ username: 'abc', email: 'a@b.com', password: '12345678' }, '1.1.1.1')).rejects.toMatchObject({
      status: 400,
    });
  });

  it('throws 400 when email format invalid', async () => {
    await expect(RegisterUseCase.execute({ username: 'validname', email: 'bad-email', password: '12345678' }, '1.1.1.1')).rejects.toMatchObject({
      status: 400,
    });
  });

  it('throws 400 when password length less than 8', async () => {
    await expect(RegisterUseCase.execute({ username: 'validname', email: 'a@b.com', password: '1234567' }, '1.1.1.1')).rejects.toMatchObject({
      status: 400,
    });
  });

  it('throws 409 when username already exists', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValueOnce({ id: 1 });

    await expect(RegisterUseCase.execute({ username: 'existing', email: 'a@b.com', password: '12345678' }, '1.1.1.1')).rejects.toMatchObject({
      status: 409,
      message: 'Username đã tồn tại',
    });
  });

  it('throws 409 when email already exists', async () => {
    vi.spyOn(User, 'findOne')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 2 });

    await expect(RegisterUseCase.execute({ username: 'validname', email: 'dup@b.com', password: '12345678' }, '1.1.1.1')).rejects.toMatchObject({
      status: 409,
      message: 'Email đã tồn tại',
    });
  });

  it('creates user with hashed password and logs register event', async () => {
    vi.spyOn(User, 'findOne')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');
    vi.spyOn(User, 'create').mockResolvedValue({
      id: 5,
      username: 'newuser',
      email: 'new@b.com',
      role: 'USER',
      created_at: '2026-05-23T00:00:00.000Z',
    });
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await RegisterUseCase.execute(
      { username: 'newuser', email: 'new@b.com', password: '12345678' },
      '3.3.3.3'
    );

    expect(bcrypt.hash).toHaveBeenCalledWith('12345678', 10);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'newuser',
        email: 'new@b.com',
        password: 'hashed-password',
        role: 'USER',
      })
    );
    expect(LoggingService.log).toHaveBeenCalledWith(5, 'REGISTER', '3.3.3.3');

    expect(result).toEqual({
      id: 5,
      username: 'newuser',
      email: 'new@b.com',
      role: 'USER',
      created_at: '2026-05-23T00:00:00.000Z',
    });
  });
});
