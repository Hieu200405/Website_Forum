const promClient = require('prom-client');

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests received, labeled by method, route, status_code',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDurationSeconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

function recordHttpRequest(req, res, next) {
  const startNs = process.hrtime.bigint();

  res.on('finish', () => {
    const route = (req.route && req.route.path) || 'unknown';
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };
    const durationSec = Number(process.hrtime.bigint() - startNs) / 1e9;
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSec);
  });

  next();
}

async function metricsHandler(req, res) {
  try {
    const body = await register.metrics();
    res.setHeader('Content-Type', register.contentType);
    res.send(body);
  } catch (err) {
    console.error('metrics handler error:', err);
    res.status(500).send('# metrics collection failed');
  }
}

module.exports = { register, recordHttpRequest, metricsHandler };
