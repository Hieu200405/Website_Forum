const authRouter = require('../../../Server/src/routes/auth.route');

function getRoute(path, method) {
  return authRouter.stack.find(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );
}

describe('auth.route', () => {
  it('registers POST /register', () => {
    const route = getRoute('/register', 'post');
    expect(route).toBeDefined();
    expect(route.route.stack.length).toBeGreaterThanOrEqual(2);
  });

  it('registers POST /login with validation chain', () => {
    const route = getRoute('/login', 'post');
    expect(route).toBeDefined();
    expect(route.route.stack.length).toBeGreaterThanOrEqual(3);
  });

  it('registers POST /google', () => {
    const route = getRoute('/google', 'post');
    expect(route).toBeDefined();
  });
});
