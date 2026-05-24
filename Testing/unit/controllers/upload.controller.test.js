const UploadController = require('../../../Server/src/controllers/upload.controller');
const { createReq, createRes } = require('../helpers/http');

describe('UploadController', () => {
  it('returns 400 when file missing', async () => {
    const req = createReq({ file: null });
    const res = createRes();

    await UploadController.uploadImage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 200 with url when file present', async () => {
    const req = createReq({ file: { path: 'http://img' } });
    const res = createRes();

    await UploadController.uploadImage(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, url: 'http://img' }));
  });
});
