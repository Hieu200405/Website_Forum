const DeleteBannedWordUseCase = require('../../../../Server/src/usecases/bannedWord/deleteBannedWord.usecase');
const BannedWordRepository = require('../../../../Server/src/repositories/bannedWord.repository');
const LoggingService = require('../../../../Server/src/services/logging.service');
const ModerationService = require('../../../../Server/src/services/moderation.service');

describe('DeleteBannedWordUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 404 when banned word not found', async () => {
    vi.spyOn(BannedWordRepository, 'findById').mockResolvedValue(null);

    await expect(DeleteBannedWordUseCase.execute(1, 2, '1.1.1.1')).rejects.toMatchObject({ status: 404 });
  });

  it('deletes word, logs, invalidates cache', async () => {
    vi.spyOn(BannedWordRepository, 'findById').mockResolvedValue({ id: 2, word: 'spam' });
    vi.spyOn(BannedWordRepository, 'delete').mockResolvedValue(1);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);
    ModerationService.lastUpdate = 999;

    const result = await DeleteBannedWordUseCase.execute(1, 2, '1.1.1.1');

    expect(BannedWordRepository.delete).toHaveBeenCalledWith(2);
    expect(LoggingService.log).toHaveBeenCalledWith(1, 'DELETE_BANNED_WORD', '1.1.1.1', { word: 'spam', id: 2 });
    expect(ModerationService.lastUpdate).toBe(0);
    expect(result).toEqual({ message: 'Xóa từ cấm thành công' });
  });
});
