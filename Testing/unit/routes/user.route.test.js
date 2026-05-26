const userRouter = require('../../../Server/src/routes/user.route');

function hasRoute(path, method) {
  return userRouter.stack.some(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );
}

describe('user.route', () => {
  it('registers self profile endpoints', () => {
    expect(hasRoute('/me', 'get')).toBe(true);
    expect(hasRoute('/me', 'put')).toBe(true);
    expect(hasRoute('/me/avatar', 'post')).toBe(true);
  });

  it('registers public profile and posts endpoints', () => {
    expect(hasRoute('/:id/profile', 'get')).toBe(true);
    expect(hasRoute('/:id/posts', 'get')).toBe(true);
  });

  it('registers follow and leaderboard endpoints', () => {
    expect(hasRoute('/:id/follow', 'post')).toBe(true);
    expect(hasRoute('/:id/follow', 'delete')).toBe(true);
    expect(hasRoute('/leaderboard', 'get')).toBe(true);
  });
});
