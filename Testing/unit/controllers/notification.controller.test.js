const NotificationController = require('../../../Server/src/controllers/notification.controller');
const Notification = require('../../../Server/src/models/notification.model');
const { createReq, createRes } = require('../helpers/http');

describe('NotificationController', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getNotifications returns 200 and count', async () => {
    vi.spyOn(Notification, 'findAll').mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const req = createReq({ user: { userId: 3 } });
    const res = createRes();

    await NotificationController.getNotifications(req, res);

    expect(Notification.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { user_id: 3 }, limit: 20 }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, count: 2 }));
  });

  it('markAsRead returns 404 when notification not found', async () => {
    vi.spyOn(Notification, 'findOne').mockResolvedValue(null);
    const req = createReq({ user: { userId: 3 }, params: { id: '9' } });
    const res = createRes();

    await NotificationController.markAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('markAsRead updates flag and saves when found', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const notification = { isRead: false, save };
    vi.spyOn(Notification, 'findOne').mockResolvedValue(notification);
    const req = createReq({ user: { userId: 3 }, params: { id: '9' } });
    const res = createRes();

    await NotificationController.markAsRead(req, res);

    expect(notification.isRead).toBe(true);
    expect(save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
