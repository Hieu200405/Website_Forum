# 🌐 Forum Project "Khởi Luận"

Dự án Forum hoàn chỉnh được xây dựng theo kiến trúc **Clean Architecture** với **Node.js + Express** (Backend) và **Next.js** (Frontend - Coming Soon).

## 🚀 Trạng thái dự án

| Module              | Status | Chi tiết                                    |
| :------------------ | :----- | :------------------------------------------ |
| **Authentication**  | ✅     | Login, Register, JWT, Role Middleware       |
| **User Management** | ✅     | Admin Ban/Unban, RBAC (User/Mod/Admin)      |
| **Core Content**    | ✅     | CRUD Posts, Comments, Reply, Categories     |
| **Interactions**    | ✅     | Like/Unlike, Sắp xếp (Newest/Most Liked)    |
| **Moderation**      | ✅     | Banned Words, Report System, Auto-Hide      |
| **System**          | ✅     | Rate Limiting (Redis), System Logs, Caching |
| **Backend API**     | ✅     | **100% Complete**                           |
| **Frontend**        | ⏳     | Planning                                    |

## 🏗️ Kiến trúc & Công nghệ

### Backend Architecture

```
Route → Middleware → Controller → UseCase → Service → Repository → Model → Database
```

### Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (Sequelize ORM)
- **Caching:** Redis (Cache-Aside Pattern)
- **Security:**
  - JWT Authentication
  - Rate Limiting (Redis-based, Atomic Increment)
  - Input Validation (express-validator)
  - Content Moderation (Automated Banned Words)

## 📁 Cấu trúc thư mục (Backend)

```
Server/
├── src/
│   ├── config/        # Config (DB, Redis, Constants)
│   ├── controllers/   # Request Handlers
│   ├── middlewares/   # Auth, Role, RateLimit, Validation
│   ├── models/        # Sequelize Definitions
│   ├── repositories/  # Data Access Layer
│   ├── routes/        # API Definations
│   ├── services/      # External Services (Redis, Logging, Moderation)
│   ├── usecases/      # Business Logic (Pure JS)
│   └── index.js       # App Entry Point
└── package.json
```

## 🔌 API Endpoints Chính

### 1. Authentication

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập (Limit: 5 req/60s)

### 2. Posts & Content

- `GET /api/posts` - Lấy danh sách (Paginate, Sort, Filter, **Cached**)
- `POST /api/posts` - Tạo bài viết (Limit: 10 req/60s)
- `GET /api/posts/:id` - Xem chi tiết
- `POST /api/posts/:id/comments` - Bình luận
- `POST /api/posts/:id/like` - Like bài viết

### 3. Moderation & Report

- `POST /api/posts/:id/report` - Báo cáo bài viết (Auto-hide nếu > 5 reports)
- `PATCH /api/moderation/posts/:postId` - Duyệt/Ẩn bài viết (Mod/Admin only)
- `GET /api/admin/banned-words` - Quản lý từ cấm

### 4. Admin Management

- `PATCH /api/admin/users/:id/ban` - Khóa tài khoản
- `PATCH /api/admin/users/:id/unban` - Mở khóa
- `GET /api/admin/logs` - Xem nhật ký hệ thống (Filter User/Action)

## 🛠️ Cài đặt và chạy

### Yêu cầu

- Node.js >= 18
- MySQL
- Redis (Docker hoặc Local Service)

### Bước 1: Khởi động Backend

```bash
cd Server
npm install
# Cấu hình file .env (tham khảo file .env.example nếu có)
npm run dev
```

### Bước 2: Chạy Test (Optional)

Hệ thống có bộ test script tự động kiểm tra các luồng nghiệp vụ phức tạp.

```bash
cd Testing
node verify_rate_limit.js      # Test chống Spam
node verify_admin_moderation.js # Test Admin Ban/Mod
node verify_report_flow.js      # Test Report & Auto-Hide
node verify_logs_flow.js        # Test System Logs
```

## 📊 Database Schema Highlights

### Posts

- `status`: 'active' | 'pending' | 'hidden'
- `hide_reason`: Lý do ẩn (nếu có)
- `like_count`: Denormalized field for performance

### Users

- `status`: 'active' | 'banned'
- `role`: 'user' | 'moderator' | 'admin'

### Reports

- Liên kết User - Post, Unique Constraint (1 user report 1 post 1 lần)

## 👥 Authors

- **23520472 - Đỗ Hoàng Hiếu** (Backend Core & Architecture)

---

**Made with ❤️ using Clean Architecture**
