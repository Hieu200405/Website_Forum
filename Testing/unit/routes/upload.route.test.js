const uploadRouter = require('../../../Server/src/routes/upload.route');

function getRoute(path, method) {
  return uploadRouter.stack.find(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );
}

describe('upload.route', () => {
  it('registers POST / with auth + upload + controller middleware chain', () => {
    const route = getRoute('/', 'post');
    expect(route).toBeDefined();
    expect(route.route.stack.length).toBeGreaterThanOrEqual(3);
  });
});
