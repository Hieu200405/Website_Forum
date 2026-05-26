const Notification = require('../../../Server/src/models/notification.model');
const NotificationService = require('../../../Server/src/services/notification.service');

describe('NotificationService.createNotification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns early when sender equals receiver', async () => {
    const createSpy = vi.spyOn(Notification, 'create').mockResolvedValue({ id: 1 });

    const result = await NotificationService.createNotification({}, {
      user_id: 1,
      sender_id: 1,
      type: 'LIKE',
      reference_id: 2,
      content: 'x',
    });

    expect(result).toBeUndefined();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('creates notification and returns model', async () => {
    vi.spyOn(Notification, 'create').mockResolvedValue({ id: 10 });
    vi.spyOn(Notification, 'findByPk').mockResolvedValue({ id: 10, sender: { id: 2, username: 'u' } });

    const io = { to: vi.fn().mockReturnValue({ emit: vi.fn() }) };
    const connectedUsers = new Map([['3', 'socket-1']]);
    const app = { get: vi.fn((k) => (k === 'io' ? io : connectedUsers)) };

    const result = await NotificationService.createNotification(app, {
      user_id: 3,
      sender_id: 2,
      type: 'COMMENT',
      reference_id: 11,
      content: 'hello',
    });

    expect(result).toEqual({ id: 10 });
    expect(Notification.create).toHaveBeenCalled();
    expect(io.to).toHaveBeenCalledWith('socket-1');
  });

  it('skips emit when receiver not connected', async () => {
    vi.spyOn(Notification, 'create').mockResolvedValue({ id: 10 });
    const io = { to: vi.fn().mockReturnValue({ emit: vi.fn() }) };
    const connectedUsers = new Map();
    const app = { get: vi.fn((k) => (k === 'io' ? io : connectedUsers)) };

    await NotificationService.createNotification(app, {
      user_id: 3,
      sender_id: 2,
      type: 'COMMENT',
      reference_id: 11,
      content: 'hello',
    });

    expect(io.to).not.toHaveBeenCalled();
  });

  it('swallows internal errors', async () => {
    vi.spyOn(Notification, 'create').mockRejectedValue(new Error('db fail'));

    await expect(
      NotificationService.createNotification({ get: vi.fn() }, {
        user_id: 3,
        sender_id: 2,
        type: 'COMMENT',
        reference_id: 11,
        content: 'hello',
      })
    ).resolves.toBeUndefined();
  });
});
