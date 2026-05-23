const upload = require('../../../Server/src/middlewares/upload.middleware');

describe('upload middleware', () => {
  it('exports multer instance with single handler function', () => {
    expect(typeof upload.single).toBe('function');
  });

  it('exports multer instance with array handler function', () => {
    expect(typeof upload.array).toBe('function');
  });

  it('exports multer instance with fields handler function', () => {
    expect(typeof upload.fields).toBe('function');
  });
});
