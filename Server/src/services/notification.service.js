const Notification = require('../models/notification.model');
const User = require('../models/user.model');

class NotificationService {
  static async createNotification(app, payload) {
    try {
      const { user_id, sender_id, type, reference_id, content } = payload;
      
      // Không tạo thông báo cho chính mình
      if (user_id === sender_id) return;

      const notification = await Notification.create({
        user_id,
        sender_id,
        type,
        reference_id,
        content
      });

      const io = app.get('io');
      const connectedUsers = app.get('connectedUsers');
      
      if (io && connectedUsers) {
        const socketId = connectedUsers.get(user_id.toString());
        if (socketId) {
          // Gửi thông báo realtime quá socket
          
          // Populate sender info for frontend
          const notificationWithSender = await Notification.findByPk(notification.id, {
            include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }]
          });
          
          io.to(socketId).emit('new_notification', notificationWithSender);
        }
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
}

module.exports = NotificationService;
