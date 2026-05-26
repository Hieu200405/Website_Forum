const commentRouter = require('../../../Server/src/routes/comment.route');

function hasRoute(path, method) {
  return commentRouter.stack.some(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );
}

describe('comment.route', () => {
  it('registers listing and creation routes', () => {
    expect(hasRoute('/post/:postId', 'get')).toBe(true);
    expect(hasRoute('/', 'post')).toBe(true);
    expect(hasRoute('/reply', 'post')).toBe(true);
  });

  it('registers like routes', () => {
    expect(hasRoute('/:id/like', 'post')).toBe(true);
    expect(hasRoute('/:id/like', 'delete')).toBe(true);
  });

  it('registers delete route', () => {
    expect(hasRoute('/:id', 'delete')).toBe(true);
  });
});
