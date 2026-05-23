const AuthController = require('../../../Server/src/controllers/auth.controller');
const RegisterUseCase = require('../../../Server/src/usecases/register.usecase');
const LoginUseCase = require('../../../Server/src/usecases/login.usecase');
const GoogleLoginUseCase = require('../../../Server/src/usecases/googleLogin.usecase');
const { createReq, createRes } = require('../helpers/http');

describe('AuthController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('register maps success to 201 and passes forwarded ip', async () => {
    vi.spyOn(RegisterUseCase, 'execute').mockResolvedValue({ id: 1 });
    const req = createReq({ body: { username: 'u' }, headers: { 'x-forwarded-for': '8.8.8.8' } });
    const res = createRes();

    await AuthController.register(req, res);

    expect(RegisterUseCase.execute).toHaveBeenCalledWith({ username: 'u' }, '8.8.8.8');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('login maps success to 200 and returns usecase payload', async () => {
    vi.spyOn(LoginUseCase, 'execute').mockResolvedValue({ accessToken: 't' });
    const req = createReq({ body: { email: 'a@b.com', password: 'pw' } });
    const res = createRes();

    await AuthController.login(req, res);

    expect(LoginUseCase.execute).toHaveBeenCalledWith('a@b.com', 'pw', '127.0.0.1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ accessToken: 't' });
  });

  it('login maps thrown status/message', async () => {
    vi.spyOn(LoginUseCase, 'execute').mockRejectedValue({ status: 401, message: 'bad credentials' });
    const req = createReq({ body: { email: 'a@b.com', password: 'pw' } });
    const res = createRes();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'bad credentials' });
  });

  it('googleLogin maps thrown status/message', async () => {
    const err = new Error('google fail');
    err.status = 400;
    vi.spyOn(GoogleLoginUseCase, 'execute').mockRejectedValue(err);
    const req = createReq({ body: { token: 'x' } });
    const res = createRes();

    await AuthController.googleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'google fail' }));
  });
});
