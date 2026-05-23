const UserRepository = require('../../../Server/src/repositories/user.repository');
const User = require('../../../Server/src/models/user.model');

describe('UserRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('findByEmail calls model with email where', async () => {
    const findOneSpy = vi.spyOn(User, 'findOne').mockResolvedValue({ id: 1 });

    const result = await UserRepository.findByEmail('x@y.com');

    expect(result).toEqual({ id: 1 });
    expect(findOneSpy).toHaveBeenCalledWith({ where: { email: 'x@y.com' } });
  });

  it('findByUsername calls model with username where', async () => {
    const findOneSpy = vi.spyOn(User, 'findOne').mockResolvedValue({ id: 2 });

    const result = await UserRepository.findByUsername('neo');

    expect(result).toEqual({ id: 2 });
    expect(findOneSpy).toHaveBeenCalledWith({ where: { username: 'neo' } });
  });

  it('update returns true when row affected', async () => {
    vi.spyOn(User, 'update').mockResolvedValue([1]);

    const result = await UserRepository.update(1, { role: 'ADMIN' });

    expect(result).toBe(true);
    expect(User.update).toHaveBeenCalledWith({ role: 'ADMIN' }, { where: { id: 1 } });
  });

  it('update returns false when no row affected', async () => {
    vi.spyOn(User, 'update').mockResolvedValue([0]);

    const result = await UserRepository.update(99, { role: 'ADMIN' });

    expect(result).toBe(false);
  });

  it('findAll uses default paging and excludes password', async () => {
    vi.spyOn(User, 'findAndCountAll').mockResolvedValue({ rows: [], count: 0 });

    await UserRepository.findAll();

    expect(User.findAndCountAll).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password'] },
    });
  });

  it('updateReputation increments when user exists', async () => {
    const increment = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(User, 'findByPk').mockResolvedValue({ increment });

    await UserRepository.updateReputation(8, 5);

    expect(increment).toHaveBeenCalledWith('reputation', { by: 5 });
  });

  it('updateReputation skips increment when user missing', async () => {
    vi.spyOn(User, 'findByPk').mockResolvedValue(null);

    await UserRepository.updateReputation(8, 5);

    expect(User.findByPk).toHaveBeenCalledWith(8);
  });
});
