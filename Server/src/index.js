require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoute = require('./routes/auth.route');
const adminRoute = require('./routes/admin.route');
const categoryRoute = require('./routes/category.route');
const postRoute = require('./routes/post.route');
const commentRoute = require('./routes/comment.route');
const bannedWordRoute = require('./routes/admin/bannedWord.route');
const reportRoute = require('./routes/report.route');
const moderationRoute = require('./routes/moderation.route');
const notificationRoute = require('./routes/notification.route');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

// Set io object on app to be used in controllers
app.set('io', io);

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/admin/banned-words', bannedWordRoute);
app.use('/api/moderation', moderationRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/posts', postRoute);
app.use('/api/comments', commentRoute);
app.use('/api/reports', reportRoute);
app.use('/api/notifications', notificationRoute);

app.get('/', (req, res) => res.send('Forum API running'));
app.get('/', (req, res) => {
  res.send('API OK');
});

// Load models để sync DB
require('./models/user.model');
require('./models/systemLog.model');
require('./models/category.model');
require('./models/post.model');
require('./models/comment.model');
require('./models/like.model');
require('./models/bannedWord.model');
require('./models/report.model');
require('./models/notification.model');
require('./models/savedPost.model');

// Custom socket mapping for connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    connectedUsers.set(userId.toString(), socket.id);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
      }
    }
  });
});

app.set('connectedUsers', connectedUsers);

// Apply Rate Limit Global
const rateLimit = require('./middlewares/rateLimit.middleware');
app.use(rateLimit);

sequelize.sync()
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Database sync error:', err));

httpServer.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
