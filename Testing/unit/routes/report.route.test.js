const reportRouter = require('../../../Server/src/routes/report.route');

function hasRoute(path, method) {
  return reportRouter.stack.some(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );
}

describe('report.route', () => {
  it('registers protected report creation route', () => {
    expect(hasRoute('/', 'post')).toBe(true);
  });
});
