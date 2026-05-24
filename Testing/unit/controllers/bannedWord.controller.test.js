const BannedWordController = require('../../../Server/src/controllers/admin/bannedWord.controller');
const AddBannedWordUseCase = require('../../../Server/src/usecases/bannedWord/addBannedWord.usecase');
const DeleteBannedWordUseCase = require('../../../Server/src/usecases/bannedWord/deleteBannedWord.usecase');
const GetBannedWordsUseCase = require('../../../Server/src/usecases/bannedWord/getBannedWords.usecase');
const { createReq, createRes } = require('../helpers/http');

describe('BannedWordController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getAll returns 200 and data', async () => {
    vi.spyOn(GetBannedWordsUseCase, 'execute').mockResolvedValue([{ id: 1, word: 'spam' }]);
    const req = createReq();
    const res = createRes();

    await BannedWordController.getAll(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 1, word: 'spam' }] });
  });

  it('add passes admin/word/ip and returns 201', async () => {
    vi.spyOn(AddBannedWordUseCase, 'execute').mockResolvedValue({ id: 2, word: 'spam' });
    const req = createReq({ user: { userId: 10 }, body: { word: 'spam' }, headers: { 'x-forwarded-for': '1.1.1.1' } });
    const res = createRes();

    await BannedWordController.add(req, res);

    expect(AddBannedWordUseCase.execute).toHaveBeenCalledWith(10, 'spam', '1.1.1.1');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('delete maps usecase error status', async () => {
    vi.spyOn(DeleteBannedWordUseCase, 'execute').mockRejectedValue({ status: 404, message: 'not found' });
    const req = createReq({ user: { userId: 10 }, params: { id: '9' } });
    const res = createRes();

    await BannedWordController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'not found' });
  });

  it('getAll maps errors to 500', async () => {
    vi.spyOn(GetBannedWordsUseCase, 'execute').mockRejectedValue(new Error('boom'));
    const req = createReq();
    const res = createRes();

    await BannedWordController.getAll(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('add maps missing status to 500', async () => {
    vi.spyOn(AddBannedWordUseCase, 'execute').mockRejectedValue({ message: 'bad' });
    const req = createReq({ user: { userId: 10 }, body: { word: 'x' } });
    const res = createRes();

    await BannedWordController.add(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('delete returns 200 on success', async () => {
    vi.spyOn(DeleteBannedWordUseCase, 'execute').mockResolvedValue({ message: 'ok' });
    const req = createReq({ user: { userId: 10 }, params: { id: '9' } });
    const res = createRes();

    await BannedWordController.delete(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'ok' });
  });
});
