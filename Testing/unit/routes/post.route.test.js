const postRouter = require('../../../Server/src/routes/post.route');

function hasRoute(path, method) {
  return postRouter.stack.some(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );
}

describe('post.route', () => {
  it('registers GET / and POST /', () => {
    expect(hasRoute('/', 'get')).toBe(true);
    expect(hasRoute('/', 'post')).toBe(true);
  });

  it('registers saved and comment routes', () => {
    expect(hasRoute('/saved', 'get')).toBe(true);
    expect(hasRoute('/:postId/comments', 'get')).toBe(true);
    expect(hasRoute('/:postId/comments', 'post')).toBe(true);
  });

  it('registers like/save/report action routes', () => {
    expect(hasRoute('/:postId/like', 'post')).toBe(true);
    expect(hasRoute('/:postId/like', 'delete')).toBe(true);
    expect(hasRoute('/:postId/save', 'post')).toBe(true);
    expect(hasRoute('/:postId/save', 'delete')).toBe(true);
    expect(hasRoute('/:postId/report', 'post')).toBe(true);
  });

  it('registers generic id routes', () => {
    expect(hasRoute('/:id', 'put')).toBe(true);
    expect(hasRoute('/:id', 'delete')).toBe(true);
    expect(hasRoute('/:id', 'get')).toBe(true);
  });
});
