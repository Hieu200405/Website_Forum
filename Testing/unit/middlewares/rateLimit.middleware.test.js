const RedisService = require('../../../Server/src/services/redis.service');
const rateLimit = require('../../../Server/src/middlewares/rateLimit.middleware');
const { createReq, createRes } = require('../helpers/http');

describe('rateLimit middleware', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('blocks login when count exceeds login limit', async () => {
    vi.spyOn(RedisService, 'increment').mockResolvedValue(6);
    const req = createReq({ method: 'POST', originalUrl: '/api/auth/login' });
    const res = createRes();
    const next = vi.fn();

    await rateLimit(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(next).not.toHaveBeenCalled();
  });

  it('uses user identifier for post route when user exists', async () => {
    const incSpy = vi.spyOn(RedisService, 'increment').mockResolvedValue(1);
    const req = createReq({ method: 'POST', originalUrl: '/api/posts', user: { userId: 10 } });
    const res = createRes();
    const next = vi.fn();

    await rateLimit(req, res, next);

    expect(incSpy).toHaveBeenCalledWith('rate:post:user_10', 60);
    expect(next).toHaveBeenCalled();
  });

  it('uses user identifier for comment route when user exists', async () => {
    const incSpy = vi.spyOn(RedisService, 'increment').mockResolvedValue(1);
    const req = createReq({ method: 'POST', originalUrl: '/api/comments', user: { userId: 7 } });
    const res = createRes();
    const next = vi.fn();

    await rateLimit(req, res, next);

    expect(incSpy).toHaveBeenCalledWith('rate:comment:user_7', 60);
    expect(next).toHaveBeenCalled();
  });

  it('falls back to ip identifier for default path', async () => {
    const incSpy = vi.spyOn(RedisService, 'increment').mockResolvedValue(1);
    const req = createReq({ method: 'GET', originalUrl: '/api/health', ip: '8.8.8.8' });
    const res = createRes();
    const next = vi.fn();

    await rateLimit(req, res, next);

    expect(incSpy).toHaveBeenCalledWith(expect.stringContaining('rate:default:'), 60);
    expect(next).toHaveBeenCalled();
  });

  it('fails open when redis throws', async () => {
    vi.spyOn(RedisService, 'increment').mockRejectedValue(new Error('redis down'));
    const req = createReq({ method: 'POST', originalUrl: '/api/auth/register' });
    const res = createRes();
    const next = vi.fn();

    await rateLimit(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
