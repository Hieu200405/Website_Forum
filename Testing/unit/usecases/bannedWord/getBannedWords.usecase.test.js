const GetBannedWordsUseCase = require('../../../../Server/src/usecases/bannedWord/getBannedWords.usecase');
const BannedWordRepository = require('../../../../Server/src/repositories/bannedWord.repository');

describe('GetBannedWordsUseCase.execute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns repository list', async () => {
    vi.spyOn(BannedWordRepository, 'findAll').mockResolvedValue([{ id: 1, word: 'spam' }]);

    const result = await GetBannedWordsUseCase.execute();

    expect(BannedWordRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1, word: 'spam' }]);
  });
});
