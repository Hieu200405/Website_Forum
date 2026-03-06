# 🌐 Forum Web Application

A comprehensive forum application built with React, Node.js, and MySQL, featuring a robust Role-Based Access Control (RBAC) system for Admins, Moderators, and standard Users.

---

## 🚀 Key Features

### 1. **Role-Based Access Control (RBAC)**

The application strictly separates functionalities and layouts based on user roles:

- **Admin**:
  - Dashboard with system statistics.
  - User Management (Ban/Unban/View).
  - Category Management (Create/Update/Delete).
  - Banned Words Management (Content moderation filters).
  - System Logs (View critical actions like Logins, Bans, Edits).
- **Moderator**:
  - Content Moderation (Approve/Reject pending posts).
  - Report Management (Handle reported posts).
- **User**:
  - Personalized Feed (Newest/Trending).
  - Create, Like, and Comment on posts.
  - View detailed post pages.

### 2. **Advanced Functionality & Integrations**

- **User Profile & Settings**:
  - Comprehensive Profile view (posts, biography, join date).
  - Account Settings: Update username, Edit bio, and **Change Password**.
  - **Avatar Upload**: Custom profile pictures hosted on **Cloudinary**.
- **Post Management**: Full CRUD support. Users can edit or delete their own posts directly from the feed or their profile.
- **Real-time Notifications**: Instant alerts for likes and comments powered by **Socket.io**.
- **Social Login**: Seamless one-tap authentication using **Google OAuth 2.0**.
- **Rich Text Editor with Cloud Storage**: Integrated **ReactQuill** editor allowing direct image uploads stored securely on **Cloudinary**.
- **Performance Caching**: Powered by **Redis** for faster data retrieval.
- **Moderation**: Automatic filtering of banned words in post titles and content.

### 3. **AI && Security (Mới Cập Nhật 🌟)**

- **AI Content Moderation**: Viết bài & Bình luận được bảo vệ 2 lớp nhờ tích hợp **Google Gemini 2.5 Flash AI** cùng bộ lọc "Banned Words". Nội dung sẽ tự động chuyển sang trạng thái "chờ duyệt" nếu AI phát hiện ngôn từ toxic/quấy rối.
- **Debounced Live Full-Text Search**: Cỗ máy tìm kiếm SQL an toàn được tối ưu cùng độ trễ tránh Spam.

### 4. **Modern UX/UI**

- **Tailwind CSS v4**: High-performance utility-first styling.
- **Responsive Design**: Fully adaptable to mobile and desktop.
- **Interactive Components**: Modals, Toast Notifications, Loading Skeletons.
- **Glassmorphism**: Modern aesthetic throughout the application.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Zustand (State Management), React Query (Server State), React Router v6.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL with Sequelize ORM.
- **Caching**: Redis.
- **Infrastructure**: Docker & Docker Compose.
- **Storage**: Cloudinary (Image Hosting).
- **Security**: JWT (JSON Web Tokens), BCrypt for password hashing.

---

## � Installation & Setup

We recommend using **Docker** for the fastest setup.

### 1. Prerequisites

- **Docker** and **Docker Compose** installed.

### 2. Environment Variables

Create a `.env` file in the root directory (and `Server/` directory) with the following values:

```env
PORT=3000
DB_HOST=db
DB_PORT=3306
DB_USER=root
DB_PASS=root
DB_NAME=forum_db
JWT_SECRET=your_jwt_secret

# Caching
REDIS_HOST=redis
REDIS_PORT=6379

# Cloudinary (Required for Avatar/Post Images)
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

### 3. Quick Start (Docker)

Run the entire stack (DB, Redis, Backend, Frontend) with one command:

```bash
docker-compose up -d --build
```

Access the app:

- **Frontend**: `http://localhost`
- **Backend API**: `http://localhost:3000`

### 4. Database Seeding (First Time Only)

To create default categories, banned words, and admin accounts:

```bash
docker exec -it forum_backend node src/seed.js
```

---

## 🔐 Default Test Accounts

(Password: `12345678` for all)

| Role            | Email             | Privileges                                             |
| :-------------- | :---------------- | :----------------------------------------------------- |
| **Admin**       | `admin@gmail.com` | Full System Access (Users, Categories, Logs, Settings) |
| **Moderator**   | `mod@gmail.com`   | Content Moderation (Reports, Approvals)                |
| **User (Guru)** | `dev@gmail.com`   | Standard User (Create Posts, Comment, Like)            |
| **User (New)**  | `new@gmail.com`   | Standard User                                          |
| **Banned User** | `spam@gmail.com`  | Restricted Access (Cannot post/comment)                |

---

## 📂 Project Structure

```
Project-Forum/
├── 📁 Forum/               # Frontend (React + Vite)
│   ├── src/features/       # Auth, Posts, Admin modules
│   ├── src/pages/user/     # Home, PostDetail, Profile, Settings
│   └── src/store/          # Zustand State (Auth, Notifications)
├── 📁 Server/              # Backend (Node.js + Express)
│   ├── src/controllers/    # Auth, Post, User handlers
│   ├── src/usecases/       # Business logic (Google Login, Posts)
│   ├── src/repositories/   # Database access layer
│   └── src/config/         # Cloudinary, Redis, Sequelize config
├── 📁 Testing/             # API & Integration test scripts
├── docker-compose.yml      # Orchestration file
└── README.md               # Documentation
```

---

## 🧪 Testing

The project includes a suite of integration verification scripts in the `Testing/` directory.

**To run tests locally:**

1. Navigate to the `Server` directory:
   ```bash
   cd Server
   ```
2. Run a verification script (PowerShell):
   ```powershell
   $env:NODE_PATH="$pwd\node_modules"
   node ..\Testing\verify_auth_flow.js
   ```

---

## � Troubleshooting

- **Cloudinary Error**: Ensure your API keys in `.env` are correct.
- **Database Sync**: If tables don't match or deletion fails, run `node src/seed.js` inside the container to reset schema with `onDelete: CASCADE` rules.
- **Logout after Update**: Fixed by using the `updateUser` action in `authStore` to preserve JWT tokens.
- **500 Error on Feed**: Ensure `saved_posts` and `notifications` tables exist (run seed script).
