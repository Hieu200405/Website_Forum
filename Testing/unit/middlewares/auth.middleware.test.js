const util = require('util');
const { createReq, createRes } = require('../helpers/http');

async function runAuthCase({ authHeader, verifyFn, userRecord }) {
  vi.resetModules();
  const promisifySpy = vi.spyOn(util, 'promisify').mockReturnValue(verifyFn);

  const User = require('../../../Server/src/models/user.model');
  const findByPkSpy = vi.spyOn(User, 'findByPk').mockResolvedValue(userRecord);

  const authMiddleware = require('../../../Server/src/middlewares/auth.middleware');

  const req = createReq({ headers: authHeader ? { authorization: authHeader } : {} });
  const res = createRes();
  const next = vi.fn();

  await authMiddleware(req, res, next);

  promisifySpy.mockRestore();
  return { req, res, next, findByPkSpy };
}

describe('authMiddleware', () => {
  it('returns 401 when authorization header missing', async () => {
    const { res, next } = await runAuthCase({ authHeader: null, verifyFn: async () => ({ userId: 1, role: 'USER' }), userRecord: null });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when header format invalid', async () => {
    const { res } = await runAuthCase({ authHeader: 'Token abc', verifyFn: async () => ({ userId: 1, role: 'USER' }), userRecord: null });
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when bearer token empty', async () => {
    const { res } = await runAuthCase({ authHeader: 'Bearer ', verifyFn: async () => ({ userId: 1, role: 'USER' }), userRecord: null });
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when token verification throws', async () => {
    const { res } = await runAuthCase({ authHeader: 'Bearer badtoken', verifyFn: async () => { throw new Error('bad'); }, userRecord: null });
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when user no longer exists', async () => {
    const { res } = await runAuthCase({
      authHeader: 'Bearer ok',
      verifyFn: async () => ({ userId: 99, role: 'USER' }),
      userRecord: null,
    });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User no longer exists' });
  });

  it('returns 403 when user is banned', async () => {
    const { res } = await runAuthCase({
      authHeader: 'Bearer ok',
      verifyFn: async () => ({ userId: 5, role: 'USER' }),
      userRecord: { id: 5, status: 'banned', banned_reason: 'spam', role: 'USER' },
    });

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('calls next and refreshes role when token valid and user active', async () => {
    const { req, next } = await runAuthCase({
      authHeader: 'Bearer ok',
      verifyFn: async () => ({ userId: 7, role: 'USER' }),
      userRecord: { id: 7, status: 'active', role: 'ADMIN' },
    });

    expect(req.user.role).toBe('ADMIN');
    expect(req.user.userId).toBeGreaterThan(0);
    expect(next).toHaveBeenCalled();
  });
});
