const RedisService = require('../../../Server/src/services/redis.service');

describe('RedisService singleton methods', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('get returns null when client closed', async () => {
    const spy = vi.spyOn(RedisService.client, 'get').mockResolvedValue('x');
    Object.defineProperty(RedisService.client, 'isOpen', { value: false, configurable: true });

    const result = await RedisService.get('k');

    expect(result).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it('get returns redis value when open', async () => {
    Object.defineProperty(RedisService.client, 'isOpen', { value: true, configurable: true });
    vi.spyOn(RedisService.client, 'get').mockResolvedValue('value');

    const result = await RedisService.get('k');

    expect(result).toBe('value');
  });

  it('set uses EX ttl when open', async () => {
    Object.defineProperty(RedisService.client, 'isOpen', { value: true, configurable: true });
    const setSpy = vi.spyOn(RedisService.client, 'set').mockResolvedValue('OK');

    await RedisService.set('k', 'v', 12);

    expect(setSpy).toHaveBeenCalledWith('k', 'v', { EX: 12 });
  });

  it('increment sets ttl when first count', async () => {
    Object.defineProperty(RedisService.client, 'isOpen', { value: true, configurable: true });
    vi.spyOn(RedisService.client, 'incr').mockResolvedValue(1);
    const expireSpy = vi.spyOn(RedisService.client, 'expire').mockResolvedValue(1);

    const value = await RedisService.increment('k', 60);

    expect(value).toBe(1);
    expect(expireSpy).toHaveBeenCalledWith('k', 60);
  });

  it('increment skips ttl when count not first', async () => {
    Object.defineProperty(RedisService.client, 'isOpen', { value: true, configurable: true });
    vi.spyOn(RedisService.client, 'incr').mockResolvedValue(2);
    const expireSpy = vi.spyOn(RedisService.client, 'expire').mockResolvedValue(1);

    const value = await RedisService.increment('k', 60);

    expect(value).toBe(2);
    expect(expireSpy).not.toHaveBeenCalled();
  });

  it('delPattern iterates matching keys and deletes each', async () => {
    Object.defineProperty(RedisService.client, 'isOpen', { value: true, configurable: true });
    RedisService.client.scanIterator = vi.fn(async function* () {
      yield 'a';
      yield 'b';
    });
    const delSpy = vi.spyOn(RedisService.client, 'del').mockResolvedValue(1);

    await RedisService.delPattern('posts:*');

    expect(delSpy).toHaveBeenCalledTimes(2);
  });
});
