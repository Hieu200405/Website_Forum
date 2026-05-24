const bannedWordRouter = require('../../../Server/src/routes/admin/bannedWord.route');

function hasRoute(path, method) {
  return bannedWordRouter.stack.some(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );
}

describe('admin/bannedWord.route', () => {
  it('registers list/add/delete endpoints', () => {
    expect(hasRoute('/', 'get')).toBe(true);
    expect(hasRoute('/', 'post')).toBe(true);
    expect(hasRoute('/:id', 'delete')).toBe(true);
  });

  it('applies middleware globally via router.use', () => {
    const useLayers = bannedWordRouter.stack.filter((layer) => !layer.route);
    expect(useLayers.length).toBeGreaterThanOrEqual(1);
  });
});
