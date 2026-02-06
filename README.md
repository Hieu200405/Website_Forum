# Forum Web App

This is a modern forum application built with:

- **Frontend**: React, Vite, Tailwind CSS v4, Zustand, React Query.
- **Backend**: Node.js, Express, MySQL, Redis.

## Features

- **Authentication**: JWT-based Login/Register with status handling.
- **Feed**: Interactive post feed with sorting (Newest, Most Liked) and pagination.
- **Create Post**: Modal-based post creation with instant feed update.
- **Interactions**: Optimistic UI updates for Liking/Unliking posts.
- **UI/UX**: Glassy modern design, responsive layout, loading skeletons, toast notifications.

## Getting Started

### Backend

1. `cd Server`
2. `npm install`
3. Check `.env` (DB Credentials, JWT Secret).
4. `npm run dev`

### Frontend

1. `cd Forum`
2. `npm install`
3. `npm run dev`
4. Visit `http://localhost:5175`

## Tech Stack Details

- **Tailwind CSS v4**: Setup with Vite plugin for high performance.
- **React Query**: Handles all server state (caching, deduplication, optimistic updates).
- **Zustand**: Manages client state (Auth, UI/Modal).
- **Headless UI Concepts**: Custom accessible modal implementation.
