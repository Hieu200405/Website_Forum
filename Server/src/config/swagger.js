const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ForumHub API',
      version: '1.0.0',
      description: `
## 🚀 ForumHub REST API

Forum cộng đồng đầy đủ tính năng với xác thực JWT, phân quyền RBAC, kiểm duyệt AI, và real-time notifications.

### Tính năng nổi bật
- 🔐 **JWT Authentication** + Google OAuth 2.0
- 👥 **RBAC** — Admin / Moderator / User
- 🤖 **AI Moderation** (Gemini) tự động kiểm duyệt nội dung
- ⚡ **Redis Caching** cho tốc độ cao
- 🔔 **Real-time Notifications** qua Socket.io
- ☁️ **Cloudinary** upload ảnh

### Xác thực
Dùng **Bearer Token** trong header Authorization:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`
      `,
      contact: {
        name: 'ForumHub Team',
        email: 'support@forumhub.dev',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: '🖥️ Development Server',
      },
      {
        url: 'https://forumhub-api.onrender.com/api',
        description: '🌐 Production Server (Render)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT token nhận được từ `/auth/login`',
        },
      },
      schemas: {
        // ─── User ────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id:         { type: 'integer', example: 1 },
            username:   { type: 'string',  example: 'john_doe' },
            email:      { type: 'string',  format: 'email', example: 'john@example.com' },
            role:       { type: 'string',  enum: ['user', 'moderator', 'admin'], example: 'user' },
            avatar:     { type: 'string',  format: 'uri', example: 'https://res.cloudinary.com/...' },
            reputation: { type: 'integer', example: 250 },
            status:     { type: 'string',  enum: ['active', 'banned'], example: 'active' },
            created_at: { type: 'string',  format: 'date-time' },
          },
        },
        // ─── Post ────────────────────────────────────────────
        Post: {
          type: 'object',
          properties: {
            id:            { type: 'integer', example: 42 },
            title:         { type: 'string',  example: 'Bắt đầu học React từ đâu?' },
            content:       { type: 'string',  example: '<p>Nội dung bài viết...</p>' },
            status:        { type: 'string',  enum: ['active', 'pending', 'hidden'], example: 'active' },
            like_count:    { type: 'integer', example: 24 },
            comment_count: { type: 'integer', example: 7 },
            created_at:    { type: 'string',  format: 'date-time' },
            author: { '$ref': '#/components/schemas/User' },
            category: {
              type: 'object',
              properties: {
                id:   { type: 'integer', example: 3 },
                name: { type: 'string',  example: 'JavaScript' },
              },
            },
          },
        },
        // ─── Comment ─────────────────────────────────────────
        Comment: {
          type: 'object',
          properties: {
            id:         { type: 'integer', example: 15 },
            content:    { type: 'string',  example: 'Bình luận rất hay!' },
            parent_id:  { type: 'integer', nullable: true, example: null },
            created_at: { type: 'string',  format: 'date-time' },
            author: { '$ref': '#/components/schemas/User' },
            replies:    { type: 'array', items: { '$ref': '#/components/schemas/Comment' } },
          },
        },
        // ─── Category ────────────────────────────────────────
        Category: {
          type: 'object',
          properties: {
            id:   { type: 'integer', example: 1 },
            name: { type: 'string',  example: 'ReactJS' },
          },
        },
        // ─── Notification ─────────────────────────────────────
        Notification: {
          type: 'object',
          properties: {
            id:           { type: 'integer', example: 5 },
            type:         { type: 'string',  enum: ['LIKE', 'COMMENT', 'FOLLOW'], example: 'LIKE' },
            content:      { type: 'string',  example: 'đã thích bài viết của bạn' },
            isRead:       { type: 'boolean', example: false },
            reference_id: { type: 'integer', example: 42 },
            created_at:   { type: 'string',  format: 'date-time' },
            sender: { '$ref': '#/components/schemas/User' },
          },
        },
        // ─── Error ───────────────────────────────────────────
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string',  example: 'Không tìm thấy tài nguyên' },
          },
        },
        // ─── Success ─────────────────────────────────────────
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string',  example: 'Thành công' },
            data:    { type: 'object' },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: '❌ Chưa xác thực — Thiếu hoặc sai JWT token',
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/Error' },
              example: { success: false, message: 'Unauthorized' },
            },
          },
        },
        Forbidden: {
          description: '🚫 Không có quyền truy cập',
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/Error' },
            },
          },
        },
        NotFound: {
          description: '🔍 Không tìm thấy tài nguyên',
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/Error' },
            },
          },
        },
        RateLimit: {
          description: '⏱️ Quá nhiều yêu cầu — Vui lòng thử lại sau',
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth',          description: '🔐 Xác thực & Đăng ký tài khoản' },
      { name: 'Posts',         description: '📝 Quản lý bài viết' },
      { name: 'Comments',      description: '💬 Bình luận & phản hồi' },
      { name: 'Users',         description: '👤 Hồ sơ & quan hệ người dùng' },
      { name: 'Notifications', description: '🔔 Thông báo real-time' },
      { name: 'Categories',    description: '🏷️ Danh mục chủ đề' },
      { name: 'Admin',         description: '🛡️ Quản trị hệ thống (Admin only)' },
      { name: 'Moderation',    description: '🤖 Kiểm duyệt nội dung (Moderator+)' },
      { name: 'Upload',        description: '☁️ Upload file lên Cloudinary' },
    ],
  },
  apis: [
    './src/routes/*.js',
    './src/routes/**/*.js',
    './src/controllers/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
