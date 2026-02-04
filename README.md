# 🌐 Forum Project

Dự án Forum được xây dựng theo kiến trúc **Clean Architecture** với **Node.js + Express** (Backend) và **React + Vite** (Frontend).

## 📋 Tổng quan

Đây là một hệ thống diễn đàn (forum) hoàn chỉnh với các tính năng:

- ✅ Đăng ký và đăng nhập tài khoản
- 🔄 Quản lý bài viết (posts)
- 💬 Bình luận (comments)
- 🛡️ Kiểm duyệt nội dung (moderation)
- 📊 Ghi log hoạt động (logging)
- 🔒 Bảo mật và xác thực

## 🏗️ Kiến trúc

### Backend Architecture

```
Route → Controller → UseCase → Service → Model → Database
```

### Tech Stack

#### Backend (Server/)

- **Framework:** Node.js + Express
- **Database:** MySQL (Sequelize ORM)
- **Cache:** Redis
- **Logging:** MySQL (Primary) + Redis (Optional)
- **Authentication:** JWT + bcrypt
- **Validation:** express-validator
- **Security:** express-rate-limit

#### Frontend (Forum/)

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** CSS

## 📁 Cấu trúc thư mục

```
Project-Forum/
├── Server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Database & Redis config
│   │   ├── models/        # Sequelize models
│   │   ├── services/      # Business services
│   │   ├── usecases/      # Use case logic
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   └── middlewares/   # Middlewares
│   ├── .env              # Environment variables
│   └── package.json
│
├── Forum/                 # Frontend React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── assets/
│   └── package.json
│
└── Testing/              # Test files & collections
    ├── test-register.js
    └── Forum_Register_API.postman_collection.json
```

## 🚀 Cài đặt và chạy

### Prerequisites

- Node.js >= 18.x
- MySQL >= 8.x
- Redis >= 6.x

### 1. Clone repository

```bash
git clone https://github.com/Hieu200405/Website_Forum
cd Project-Forum
```

### 2. Cài đặt Backend

```bash
cd Server
npm install
```

### 3. Cấu hình môi trường (.env)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=forum_db
JWT_SECRET=your_secret_key
```

### 4. Tạo database

```sql
CREATE DATABASE forum_db;
```

### 5. Khởi động services

**Terminal 1: Redis**

```bash
redis-server
```

**Terminal 2: Backend**

```bash
cd Server
npm run dev
```

**Terminal 3: Frontend**

```bash
cd Forum
npm install
npm run dev
```

## 🧪 Testing

Xem hướng dẫn chi tiết trong thư mục `Testing/`

### Quick Test

```bash
cd Testing
node test-register.js
```

### Postman Collection

Import file `Testing/Forum_Register_API.postman_collection.json` vào Postman để test API.

## 📊 Database Schema

### Table: users

| Column     | Type         | Constraints                 |
| ---------- | ------------ | --------------------------- |
| id         | INTEGER      | PRIMARY KEY, AUTO_INCREMENT |
| username   | VARCHAR(30)  | UNIQUE, NOT NULL            |
| email      | VARCHAR(100) | UNIQUE, NOT NULL            |
| password   | VARCHAR(255) | NOT NULL (hashed)           |
| role       | VARCHAR(20)  | DEFAULT 'user'              |
| created_at | TIMESTAMP    | AUTO                        |
| updated_at | TIMESTAMP    | AUTO                        |

### Table: system_logs

| Column     | Type        | Constraints                 |
| ---------- | ----------- | --------------------------- |
| id         | INTEGER     | PRIMARY KEY, AUTO_INCREMENT |
| user_id    | INTEGER     | ALLOW NULL, FK -> users(id) |
| action     | VARCHAR(50) | NOT NULL                    |
| ip         | VARCHAR(45) | ALLOW NULL                  |
| data       | TEXT        | ALLOW NULL (JSON)           |
| level      | VARCHAR(20) | DEFAULT 'INFO'              |
| created_at | TIMESTAMP   | AUTO                        |

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập

### Admin (Phân quyền)

- `PUT /api/admin/users/:id/role` - Thay đổi quyền hạn User (Admin only)

### Posts (Coming soon)

- `GET /api/posts` - Lấy danh sách bài viết
- `POST /api/posts` - Tạo bài viết mới
- `GET /api/posts/:id` - Xem chi tiết bài viết
- `PUT /api/posts/:id` - Cập nhật bài viết
- `DELETE /api/posts/:id` - Xóa bài viết

### Comments (Coming soon)

- `GET /api/posts/:id/comments` - Lấy comments của bài viết
- `POST /api/posts/:id/comments` - Thêm comment

## 🎯 Roadmap

### Phase 1: Forum Khởi luận ✅ (Completed)

- [x] User registration & login
- [x] Database setup (MySQL)
- [x] Redis integration
- [x] Logging service (MySQL + Redis)
- [x] Authentication & Authorization (JWT + RBAC)
- [x] Middleware (Auth, Role, Rate Limit, Validate)
- [ ] Frontend UI

### Phase 2: Use Case 🔄 (In Progress)

- [ ] Create posts
- [ ] View posts
- [ ] Comments system
- [ ] Like/Dislike

### Phase 3: Moderation ⏳

- [ ] Admin dashboard
- [ ] Content moderation
- [ ] User management

### Phase 4: Logging ⏳

- [ ] Activity logs
- [ ] Error logs
- [ ] Analytics

### Phase 5: Bảo mật 🔄

- [x] Rate limiting
- [x] Input sanitization (via Sequelize & Validator)
- [ ] CSRF protection
- [ ] XSS protection

## 🔒 Security Features

- ✅ Password hashing với bcrypt
- ✅ JWT authentication
- ✅ Input validation
- ✅ SQL injection prevention (Sequelize ORM)
- ✅ Rate limiting (express-rate-limit)
- 🔄 CSRF protection (Coming soon)

## 📝 Logging

Hệ thống sử dụng **MySQL** làm kho lưu trữ logs chính (bảng `system_logs`) để đảm bảo tính bền vững và dễ dàng truy vấn. Redis có thể được sử dụng như một lớp đệm hoặc cache.

- **Storage:** MySQL Table `system_logs`
- **Fields:** `userId`, `action`, `ip`, `data`, `level`
- **Queries:** Hỗ trợ SQL queries để lọc log theo user, action, time.

(Cũ - Optional) Redis Logs:

- Auto-expiration (30 ngày)
- Key pattern: `log:{ACTION}:{timestamp}`
- Hỗ trợ query logs theo action

### Xem logs

```bash
redis-cli
KEYS log:REGISTER:*
GET log:REGISTER:1738562656123
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **23520472 - Đỗ Hoàng Hiếu** - Initial work

## 🙏 Acknowledgments

- Clean Architecture principles
- Express.js community
- React community
- Sequelize ORM

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**Made with ❤️ using Node.js, Express, React, and Vite**
