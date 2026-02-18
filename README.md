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

### 2. **Modern UX/UI**

- **Tailwind CSS v4**: High-performance utility-first styling.
- **Responsive Design**: Fully adaptable to mobile and desktop.
- **Interactive Components**: Modals, Toast Notifications, Loading Skeletons.
- **Glassmorphism**: Modern aesthetic throughout the application.

### 3. **Tech Stack**

- **Frontend**: React (Vite), Zustand (State Management), React Query (Server State), React Router v6.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL with Sequelize ORM.
- **Authentication**: JWT (JSON Web Tokens) with secure cookie/localStorage handling.

---

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js**: v18+ recommended.
- **MySQL**: Running instance.

### 1. Database Setup

Ensure your MySQL server is running and create a database (e.g., `forum_db`). Update the `.env` file in the `Server` directory with your credentials.

### 2. Backend Setup

Navigate to the `Server` directory:

```bash
cd Server
npm install
```

Configure your `.env` file (example):

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=forum_db
JWT_SECRET=your_jwt_secret_key
```

**Seed the Database (Create Tables & Default Data):**
This is crucial for setting up the initial Admin/Mod accounts.

```bash
node src/seed.js
```

_Note: This script will drop existing tables and recreate them with sample data._

**Start the Server:**

```bash
npm run dev
```

### 3. Frontend Setup

Navigate to the `Forum` directory (in a new terminal):

```bash
cd Forum
npm install
```

**Start the Client:**

```bash
npm run dev
```

Access the application at: `http://localhost:5173` (or the port shown in terminal).

---

## 🔐 Default Test Accounts

Use these accounts to explore different roles (password is `12345678` for all):

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
├── 📁 Server/              # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/         # DB & App Config
│   │   ├── controllers/    # Request Handlers
│   │   ├── models/         # Sequelize Models
│   │   ├── routes/         # API Routes
│   │   ├── middleware/     # Auth & Error Handling
│   │   └── seed.js         # Database Seeding Script
│   └── .env                # Environment Variables
│
├── 📁 Forum/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── features/       # Feature-based Modules (Auth, Posts, Admin, etc.)
│   │   ├── layouts/        # Layout Wrappers (AdminLayout, UserLayout, etc.)
│   │   ├── pages/          # Page Components
│   │   │   ├── admin/      # Admin Pages (ManageUsers, Dashboard...)
│   │   │   ├── auth/       # Login/Register Pages
│   │   │   ├── moderator/  # Moderator Pages (Reports...)
│   │   │   └── user/       # User Pages (Home, PostDetail...)
│   │   ├── routes/         # App Routing Configuration
│   │   └── store/          # Global State (Zustand)
│   └── index.css           # Global Styles (Tailwind)
│
└── README.md               # Project Documentation
├── 📁 Testing/             # Integration & API Flow Verification Scripts
```

## 🧪 Testing

The project includes a suite of integration verification scripts in the `Testing/` directory. These scripts verify critical flows like Authentication, Posting, and Moderation using the registered backend routes.

**To run tests locally:**

1. Ensure the Backend Server is **NOT** running (the tests start their own mock app instance or connect solely via DB/Supertest).
   _Note: Some tests might require the server to be running if they fetch against localhost, but the current scripts use `supertest` with the Express app instance._ -> _Correction: The scripts import `app` or routes, so they likely start their own instance._
2. Navigate to the `Server` directory:
   ```bash
   cd Server
   ```
3. Run a specific verification script (ensure `NODE_PATH` includes `Server/node_modules`):
   _Linux/Mac/Git Bash:_
   ```bash
   export NODE_PATH=$(pwd)/node_modules
   node ../Testing/verify_auth_flow.js
   ```
   _Windows PowerShell:_
   ```powershell
   $env:NODE_PATH="$pwd\node_modules"
   node ..\Testing\verify_auth_flow.js
   ```

## 🔄 Continuous Integration (CI)

This project uses **GitHub Actions** for CI/CD.

- **Workflow File**: `.github/workflows/ci.yml`
- **Triggers**: Push and Pull Request to `main` or `master` branches.
- **Jobs**:
  1.  **Backend Test**:
      - Sets up MySQL and Redis services.
      - Installs backend dependencies.
      - Runs all verification scripts in `Testing/`.
  2.  **Frontend Build**:
      - Installs frontend dependencies.
      - Runs ESLint.
      - Builds the React application.

## 🐛 Troubleshooting

- **Login 403 Forbidden**: Ensure you ran `node src/seed.js` to create the correct user roles. The system distinguishes between `admin`, `moderator`, and `user`.
- **Database Connection Error**: Check your MySQL credentials in `Server/.env`.
- **Module Not Found**: Try deleting `node_modules` and running `npm install` again.
