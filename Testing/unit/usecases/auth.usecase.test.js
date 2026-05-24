const path = require('path');
const { createRequire } = require('module');

const serverRequire = createRequire(path.resolve(__dirname, '../../../Server/package.json'));
const bcrypt = serverRequire('bcryptjs');
const jwt = serverRequire('jsonwebtoken');

const AuthUseCase = require('../../../Server/src/usecases/auth.usecase');
const User = require('../../../Server/src/models/user.model');
const { createReq, createRes } = require('../helpers/http');

describe('auth.usecase', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('register hashes password, creates user, and returns 201', async () => {
    vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashed');
    vi.spyOn(User, 'create').mockResolvedValue({ id: 1 });
    const req = createReq({ body: { username: 'u', email: 'e@x.com', password: '123456' } });
    const res = createRes();

    await AuthUseCase.register(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    expect(User.create).toHaveBeenCalledWith({ username: 'u', email: 'e@x.com', password: 'hashed' });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('login returns 401 when user missing', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue(null);
    const req = createReq({ body: { email: 'x@y.com', password: 'pw' } });
    const res = createRes();

    await AuthUseCase.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('login returns 401 when password mismatch', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue({ id: 1, role: 'USER', password: 'hashed' });
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(false);
    const req = createReq({ body: { email: 'x@y.com', password: 'bad' } });
    const res = createRes();

    await AuthUseCase.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('login returns token when credentials valid', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue({ id: 2, role: 'ADMIN', password: 'hashed' });
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    vi.spyOn(jwt, 'sign').mockReturnValue('token-abc');
    const req = createReq({ body: { email: 'x@y.com', password: 'ok' } });
    const res = createRes();

    await AuthUseCase.login(req, res);

    expect(jwt.sign).toHaveBeenCalledWith({ id: 2, role: 'ADMIN' }, process.env.JWT_SECRET);
    expect(res.json).toHaveBeenCalledWith({ token: 'token-abc' });
  });
});
