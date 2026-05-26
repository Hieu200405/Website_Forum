const { createReq, createRes } = require('../helpers/http');

describe('metrics middleware', () => {
  let metricsModule;

  beforeEach(async () => {
    vi.resetModules();
    metricsModule = require('../../../Server/src/middlewares/metrics.middleware');
    metricsModule.register.resetMetrics();
  });

  it('exposes a prom-client registry', () => {
    expect(metricsModule.register).toBeDefined();
    expect(typeof metricsModule.register.metrics).toBe('function');
  });

  it('exports a recordHttpRequest middleware function', () => {
    expect(typeof metricsModule.recordHttpRequest).toBe('function');
  });

  it('exports a metricsHandler function', () => {
    expect(typeof metricsModule.metricsHandler).toBe('function');
  });

  it('records request duration and counter on res.finish', async () => {
    const req = createReq({ method: 'GET', route: { path: '/api/health' } });
    const res = createRes();
    res.statusCode = 200;
    const listeners = {};
    res.on = vi.fn((event, cb) => { listeners[event] = cb; });
    const next = vi.fn();

    metricsModule.recordHttpRequest(req, res, next);
    expect(next).toHaveBeenCalled();

    // simulate response finish
    listeners.finish();

    const output = await metricsModule.register.metrics();
    expect(output).toContain('http_requests_total{method="GET",route="/api/health",status_code="200"} 1');
    expect(output).toContain('http_request_duration_seconds_bucket');
  });

  it('uses "unknown" route label when req.route is undefined', async () => {
    const req = createReq({ method: 'GET' });
    const res = createRes();
    res.statusCode = 404;
    const listeners = {};
    res.on = vi.fn((event, cb) => { listeners[event] = cb; });
    const next = vi.fn();

    metricsModule.recordHttpRequest(req, res, next);
    listeners.finish();

    const output = await metricsModule.register.metrics();
    expect(output).toContain('route="unknown"');
  });

  it('metricsHandler returns metrics text with correct content-type', async () => {
    const req = createReq();
    const res = createRes();

    await metricsModule.metricsHandler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      expect.stringContaining('text/plain')
    );
    expect(res.send).toHaveBeenCalled();
  });

  it('metricsHandler returns 500 if registry throws', async () => {
    const req = createReq();
    const res = createRes();
    vi.spyOn(metricsModule.register, 'metrics').mockRejectedValue(new Error('boom'));

    await metricsModule.metricsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
