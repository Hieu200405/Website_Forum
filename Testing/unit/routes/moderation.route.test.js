const moderationRouter = require('../../../Server/src/routes/moderation.route');

function hasRoute(path, method) {
  return moderationRouter.stack.some(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );
}

describe('moderation.route', () => {
  it('registers moderation endpoints', () => {
    expect(hasRoute('/stats', 'get')).toBe(true);
    expect(hasRoute('/posts', 'get')).toBe(true);
    expect(hasRoute('/posts/:postId', 'patch')).toBe(true);
  });
});
