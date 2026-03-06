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
const uploadRoute = require('./routes/upload.route');
const userRoute = require('./routes/user.route');
const { createServer } = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

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

// ─── Swagger API Docs ──────────────────────────────────────────
const swaggerUiOptions = {
  customSiteTitle: 'ForumHub API Docs',
  customCss: `
    .swagger-ui .topbar { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 12px 0; }
    .swagger-ui .topbar-wrapper .link { display: flex; align-items: center; gap: 10px; }
    .swagger-ui .topbar-wrapper .link::before { content: '🚀 ForumHub'; color: white; font-weight: 900; font-size: 20px; }
    .swagger-ui .topbar-wrapper img { display: none; }
    .swagger-ui .info .title { color: #6366f1; }
    .swagger-ui .btn.authorize { background: #6366f1; border-color: #6366f1; }
    .swagger-ui .btn.authorize:hover { background: #4f46e5; }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #6366f1; }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #10b981; }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #ef4444; }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #f59e0b; }
    .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #f97316; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get('/api/docs.json', (req, res) => { res.setHeader('Content-Type', 'application/json'); res.send(swaggerSpec); });
// ──────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/admin/banned-words', bannedWordRoute);
app.use('/api/moderation', moderationRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/posts', postRoute);
app.use('/api/comments', commentRoute);
app.use('/api/reports', reportRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/upload', uploadRoute);

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
require('./models/follow.model');

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
