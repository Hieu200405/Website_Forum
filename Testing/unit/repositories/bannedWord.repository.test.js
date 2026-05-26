const BannedWordRepository = require('../../../Server/src/repositories/bannedWord.repository');
const BannedWord = require('../../../Server/src/models/bannedWord.model');

describe('BannedWordRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('create delegates to model create', async () => {
    vi.spyOn(BannedWord, 'create').mockResolvedValue({ id: 1, word: 'spam' });

    const result = await BannedWordRepository.create('spam');

    expect(BannedWord.create).toHaveBeenCalledWith({ word: 'spam' });
    expect(result).toEqual({ id: 1, word: 'spam' });
  });

  it('findByWord delegates to findOne', async () => {
    vi.spyOn(BannedWord, 'findOne').mockResolvedValue({ id: 2, word: 'toxic' });

    const result = await BannedWordRepository.findByWord('toxic');

    expect(BannedWord.findOne).toHaveBeenCalledWith({ where: { word: 'toxic' } });
    expect(result).toEqual({ id: 2, word: 'toxic' });
  });

  it('findById delegates to findByPk', async () => {
    vi.spyOn(BannedWord, 'findByPk').mockResolvedValue({ id: 3 });

    const result = await BannedWordRepository.findById(3);

    expect(BannedWord.findByPk).toHaveBeenCalledWith(3);
    expect(result).toEqual({ id: 3 });
  });

  it('delete delegates to destroy', async () => {
    vi.spyOn(BannedWord, 'destroy').mockResolvedValue(1);

    const result = await BannedWordRepository.delete(4);

    expect(BannedWord.destroy).toHaveBeenCalledWith({ where: { id: 4 } });
    expect(result).toBe(1);
  });

  it('findAll orders by created_at desc', async () => {
    vi.spyOn(BannedWord, 'findAll').mockResolvedValue([]);

    await BannedWordRepository.findAll();

    expect(BannedWord.findAll).toHaveBeenCalledWith({ order: [['created_at', 'DESC']] });
  });

  it('findAllWords returns mapped word array', async () => {
    vi.spyOn(BannedWord, 'findAll').mockResolvedValue([{ word: 'spam' }, { word: 'toxic' }]);

    const result = await BannedWordRepository.findAllWords();

    expect(BannedWord.findAll).toHaveBeenCalledWith({ attributes: ['word'] });
    expect(result).toEqual(['spam', 'toxic']);
  });
});
