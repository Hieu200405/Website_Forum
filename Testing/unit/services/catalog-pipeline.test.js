const { buildLocMap } = require('../scripts/loc-map');

describe('catalog pipeline', () => {
  it('returns loc for declared function path', () => {
    const locMap = buildLocMap(['src/usecases/login.usecase.js']);
    expect(locMap['src/usecases/login.usecase.js']).toBeGreaterThan(0);
  });
});
