const Notification = require('../models/notification.model');
const User = require('../models/user.model');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.userId },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 20
    });

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    console.error('Lỗi khi lấy thông báo:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, user_id: req.user.userId }
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, message: 'Đã đánh dấu là đã đọc' });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông báo:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
