# 🌐 Forum Hub: Advanced Community Platform

A premium, feature-rich forum application built with an enterprise-grade stack (React 19, Node.js, MySQL, Redis, and Docker). This platform delivers a modern social networking experience with a personalized feed, AI-driven moderation, and a high-performance architecture.

---

## 🚀 Key Features

### 1. **Personalized Feed & Discovery** (Mới Cập Nhật 🌟)

- **"Cho bạn" (For You) Tab**: An intelligent discovery algorithm that prioritizes content from people you follow and posts similar to your past interactions.
- **Multi-Sort Discovery**: Seamlessly switch between **Most Liked** (Popularity), **Newest** (Chronological), and **Category-based** filters.
- **Engagement Weights**: Ranking system powered by Following status (+100), Liked user history (+50), and real-time popularity.

### 2. **Advanced Media & Rich Content**

- **Cloudinary Orchestration**: High-speed image hosting for User Avatars, Post Cover Images, and Inline Media in comments.
- **Cover Images**: Set a primary visual header for posts to increase engagement and visual appeal in the feed.
- **Image-Ready Comments**: Attach images directly to comments and replies with instant previews and high-fidelity display.
- **Rich Text Editor**: Powered by **ReactQuill** with full support for Markdown-style formatting, code highlighting, and media embeds.

### 3. **AI-Powered Governance & Security**

- **Dual-Layer Moderation**: Content is protected by both a **Rule-based Banned Word filter** and **Google Gemini 1.5 Flash AI**.
- **Self-Healing Feed**: Posts with suspicious content are automatically flagged and sent to a "Pending" queue for Moderator approval.
- **RBAC (Role-Based Access Control)**:
  - **Admin**: Full control over users, categories, banning words, and system audit logs.
  - **Moderator**: Dynamic dashboard to manage reports and approve/reject pending content.
  - **User**: Rich interaction suite including Profile customization, Social Following, and Interaction history.

### 4. **Scalability & Performance**

- **Redis Layer**: Aggressive caching strategy for public feeds and frequently accessed post details to ensure sub-100ms response times.
- **Optimized SQL Retrieval**: Enterprise-grade queries utilizing complex joins and aggregations, optimized for large datasets and strict SQL modes.
- **Dockerized Infrastructure**: One-click deployment for the entire micro-ecosystem (App, DB, Cache).

---

## 🛠️ Tech Stack

- **Frontend**: `React 19`, `Zustand` (Fast State), `React Query` (Data Sync), `Tailwind CSS v4`.
- **Backend**: `Node.js`, `Express.js`, `Sequelize ORM`.
- **Intelligent Services**: `Google Generative AI (Gemini)`.
- **Storage & Cache**: `MySQL 8.0`, `Redis Alpine`, `Cloudinary`.
- **Real-time**: `Socket.io` (Instant Alerts).
- **Security**: `JWT`, `Google OAuth 2.0`, `BCrypt`.

---

## ⚙️ Installation & Setup

### 1. Prerequisites

- **Docker Desktop** and **Docker Compose** installed.

### 2. Configure Environment

Create a `.env` file in the root directory with the following configuration:

```env
# Server Config
PORT=3000
DB_HOST=db
DB_USER=root
DB_PASS=root
DB_NAME=forum_db
JWT_SECRET=your_secure_secret_key

# Caching Layer
REDIS_HOST=redis
REDIS_PORT=6379

# Media Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI & Social (Google Cloud Console)
GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Launch System

Run the following command to build and start all services in the background:

```bash
docker-compose up -d --build
```

### 4. Prime the Database

Initialize default settings, categories, and administrative accounts:

```bash
docker exec -it forum_backend node src/seed.js
```

---

## 📂 System Architecture

```
Website_Forum/
├── 📁 Forum/               # Frontend (Vite + React)
│   ├── src/features/       # Modular features (Auth, Feed, Moderation)
│   └── src/lib/            # Utility services (API, Uploads)
├── 📁 Server/              # Backend (Clean Architecture)
│   ├── src/usecases/       # Domain-specific business logic
│   ├── src/repositories/   # Data access abstraction
│   └── src/services/       # Infrastructure (AI, Cache, Logs)
└── docker-compose.yml      # Service orchestration
```

---

## 🧪 Quality Assurance

Run integration tests to verify critical flows (Auth, Post Creation, Moderation):

```bash
# Inside the container or local Server directory
node ../Testing/verify_auth_flow.js
```

---

## 💡 Troubleshooting

- **API 500 Errors**: Ensure the database is seeded (`node src/seed.js`) to create required columns and tables.
- **AI Not Flagging**: Verify the `GEMINI_API_KEY` has active quotas for the `Gemini 1.5 Flash` model.
- **Images Not Loading**: Check Cloudinary credentials and ensure the `image_url` column exists in `posts`/`comments` tables.

---

_Made with ❤️ by Antigravity for the Modern Web._
