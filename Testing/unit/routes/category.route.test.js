const categoryRouter = require('../../../Server/src/routes/category.route');

function hasRoute(path, method) {
  return categoryRouter.stack.some(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );
}

describe('category.route', () => {
  it('registers public get all route', () => {
    expect(hasRoute('/', 'get')).toBe(true);
  });

  it('registers admin create/update/delete routes', () => {
    expect(hasRoute('/', 'post')).toBe(true);
    expect(hasRoute('/:id', 'put')).toBe(true);
    expect(hasRoute('/:id', 'delete')).toBe(true);
  });
});
