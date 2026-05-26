const BannedWordRepository = require('../../../Server/src/repositories/bannedWord.repository');
const PostRepository = require('../../../Server/src/repositories/post.repository');
const ReportRepository = require('../../../Server/src/repositories/report.repository');
const LoggingService = require('../../../Server/src/services/logging.service');
const ModerationService = require('../../../Server/src/services/moderation.service');

describe('ModerationService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    ModerationService.cache = [];
    ModerationService.lastUpdate = 0;
  });

  it('loads banned words and caches lowercase values', async () => {
    vi.spyOn(BannedWordRepository, 'findAllWords').mockResolvedValue(['Spam', 'Toxic']);

    const words = await ModerationService.loadBannedWords();

    expect(words).toEqual(['spam', 'toxic']);
  });

  it('reuses cache before ttl expires', async () => {
    const repoSpy = vi.spyOn(BannedWordRepository, 'findAllWords').mockResolvedValue(['Spam']);

    await ModerationService.loadBannedWords();
    await ModerationService.loadBannedWords();

    expect(repoSpy).toHaveBeenCalledTimes(1);
  });

  it('check returns valid for empty text', async () => {
    const result = await ModerationService.check('');
    expect(result).toEqual({ isValid: true, bannedWordsFound: [] });
  });

  it('check returns invalid when banned word found', async () => {
    vi.spyOn(BannedWordRepository, 'findAllWords').mockResolvedValue(['badword']);

    const result = await ModerationService.check('contains badword here');

    expect(result.isValid).toBe(false);
    expect(result.bannedWordsFound).toEqual(['badword']);
  });

  it('check uses aiCheck when rule-based clean', async () => {
    vi.spyOn(BannedWordRepository, 'findAllWords').mockResolvedValue([]);
    vi.spyOn(ModerationService, 'aiCheck').mockResolvedValue({ isValid: false, reason: 'AI says toxic' });

    const result = await ModerationService.check('clean words');

    expect(result).toEqual({ isValid: false, bannedWordsFound: [], aiReason: 'AI says toxic' });
  });

  it('aiCheck bypasses when api key missing', async () => {
    const old = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const result = await ModerationService.aiCheck('text');

    process.env.GEMINI_API_KEY = old;
    expect(result.isValid).toBe(true);
  });

  it('hidePostIfExceededReports hides active post above threshold', async () => {
    vi.spyOn(ReportRepository, 'countByPostId').mockResolvedValue(999);
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({ id: 5, status: 'active' });
    vi.spyOn(PostRepository, 'updateStatus').mockResolvedValue(true);
    vi.spyOn(LoggingService, 'log').mockResolvedValue(undefined);

    const result = await ModerationService.hidePostIfExceededReports(5);

    expect(result).toBe(true);
    expect(PostRepository.updateStatus).toHaveBeenCalledWith(5, 'hidden');
  });

  it('hidePostIfExceededReports returns false when post not active', async () => {
    vi.spyOn(ReportRepository, 'countByPostId').mockResolvedValue(999);
    vi.spyOn(PostRepository, 'findById').mockResolvedValue({ id: 5, status: 'pending' });

    const result = await ModerationService.hidePostIfExceededReports(5);

    expect(result).toBe(false);
  });
});
