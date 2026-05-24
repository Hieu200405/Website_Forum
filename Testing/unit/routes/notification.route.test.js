const notificationRouter = require('../../../Server/src/routes/notification.route');

function hasRoute(path, method) {
  return notificationRouter.stack.some(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );
}

describe('notification.route', () => {
  it('registers get and mark-as-read endpoints', () => {
    expect(hasRoute('/', 'get')).toBe(true);
    expect(hasRoute('/:id/read', 'put')).toBe(true);
  });
});
