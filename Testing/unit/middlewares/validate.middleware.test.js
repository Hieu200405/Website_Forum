const path = require('path');
const { createRequire } = require('module');

const serverRequire = createRequire(path.resolve(__dirname, '../../../Server/package.json'));
const { body } = serverRequire('express-validator');

const validate = require('../../../Server/src/middlewares/validate.middleware');
const { createReq, createRes } = require('../helpers/http');

describe('validate middleware', () => {
  it('returns 400 with formatted errors when validation fails', async () => {
    const req = createReq({ body: { email: 'not-an-email' } });
    const res = createRes();
    const next = vi.fn();

    await body('email').isEmail().withMessage('bad input').run(req);
    validate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        errors: expect.arrayContaining([expect.objectContaining({ msg: 'bad input' })]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when validation has no errors', async () => {
    const req = createReq({ body: { email: 'ok@example.com' } });
    const res = createRes();
    const next = vi.fn();

    await body('email').isEmail().run(req);
    validate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
