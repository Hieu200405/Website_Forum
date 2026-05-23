const roleMiddleware = require('../../../Server/src/middlewares/role.middleware');
const { createReq, createRes } = require('../helpers/http');

describe('roleMiddleware', () => {
  it('returns 401 when req.user missing', () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    roleMiddleware(['ADMIN'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when role not allowed', () => {
    const req = createReq({ user: { role: 'USER' } });
    const res = createRes();
    const next = vi.fn();

    roleMiddleware(['ADMIN'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows case-insensitive role match', () => {
    const req = createReq({ user: { role: 'admin' } });
    const res = createRes();
    const next = vi.fn();

    roleMiddleware(['ADMIN'])(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 403 for empty role value', () => {
    const req = createReq({ user: { role: null } });
    const res = createRes();
    const next = vi.fn();

    roleMiddleware(['ADMIN'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows when role exists in multi-role allowlist', () => {
    const req = createReq({ user: { role: 'MODERATOR' } });
    const res = createRes();
    const next = vi.fn();

    roleMiddleware(['ADMIN', 'MODERATOR'])(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
