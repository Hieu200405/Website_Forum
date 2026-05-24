const AddBannedWordUseCase = require('../../../../Server/src/usecases/bannedWord/addBannedWord.usecase');
const BannedWordRepository = require('../../../../Server/src/repositories/bannedWord.repository');
const LoggingService = require('../../../../Server/src/services/logging.service');
const ModerationService = require('../../../../Server/src/services/moderation.service');

describe('AddBannedWordUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws 400 when word missing/blank', async () => {
    await expect(AddBannedWordUseCase.execute(1, '   ', '1.1.1.1')).rejects.toMatchObject({ status: 400 });
  });

  it('throws 409 on duplicate word', async () => {
    vi.spyOn(BannedWordRepository, 'findByWord').mockResolvedValue({ id: 1 });

    await expect(AddBannedWordUseCase.execute(1, 'spam', '1.1.1.1')).rejects.toMatchObject({ status: 409 });
  });

  it('creates normalized word, logs, invalidates cache', async () => {
    vi.spyOn(BannedWordRepository, 'findByWord').mockResolvedValue(null);
    vi.spyOn(BannedWordRepository, 'create').mockResolvedValue({ id: 2, word: 'spam' });
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);
    ModerationService.lastUpdate = 123;

    const result = await AddBannedWordUseCase.execute(1, '  SPAM  ', '1.1.1.1');

    expect(BannedWordRepository.findByWord).toHaveBeenCalledWith('spam');
    expect(BannedWordRepository.create).toHaveBeenCalledWith('spam');
    expect(LoggingService.log).toHaveBeenCalledWith(1, 'ADD_BANNED_WORD', '1.1.1.1', { word: 'spam', id: 2 });
    expect(ModerationService.lastUpdate).toBe(0);
    expect(result).toEqual({ id: 2, word: 'spam' });
  });
});
