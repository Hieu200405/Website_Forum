const adminRouter = require('../../../Server/src/routes/admin.route');

function getRoute(path, method) {
  return adminRouter.stack.find(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );
}

describe('admin.route', () => {
  it('registers user management routes', () => {
    expect(getRoute('/users', 'get')).toBeDefined();
    expect(getRoute('/users/:id/ban', 'patch')).toBeDefined();
    expect(getRoute('/users/:id/unban', 'patch')).toBeDefined();
  });

  it('registers reports/stats/logs routes', () => {
    expect(getRoute('/reports', 'get')).toBeDefined();
    expect(getRoute('/stats', 'get')).toBeDefined();
    expect(getRoute('/logs', 'get')).toBeDefined();
  });

  it('keeps auth + role middleware chain on protected endpoints', () => {
    expect(getRoute('/users', 'get').route.stack.length).toBeGreaterThanOrEqual(2);
    expect(getRoute('/reports', 'get').route.stack.length).toBeGreaterThanOrEqual(2);
  });
});
