
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

// Layouts (not lazy — needed immediately)
import UserLayout from '@/layouts/UserLayout';
import AdminLayout from '@/layouts/AdminLayout';
import ModeratorLayout from '@/layouts/ModeratorLayout';

// ─── Lazy-loaded Pages ───────────────────────────────────────────
// Public
const LoginPage      = React.lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage   = React.lazy(() => import('@/pages/auth/RegisterPage'));
const Unauthorized   = React.lazy(() => import('@/pages/auth/Unauthorized'));

// User
const UserHome       = React.lazy(() => import('@/pages/user/Home'));
const UserPostDetail = React.lazy(() => import('@/pages/user/PostDetail'));
const CreatePost     = React.lazy(() => import('@/pages/user/CreatePost'));
const SavedPostsList = React.lazy(() => import('@/pages/user/SavedPosts'));
const Profile        = React.lazy(() => import('@/pages/user/Profile'));
const Settings       = React.lazy(() => import('@/pages/user/Settings'));
const Leaderboard    = React.lazy(() => import('@/pages/user/Leaderboard'));

// Admin
const AdminDashboard   = React.lazy(() => import('@/pages/admin/Dashboard'));
const ManageUsers      = React.lazy(() => import('@/pages/admin/ManageUsers'));
const ManageCategories = React.lazy(() => import('@/pages/admin/ManageCategories'));
const ManageBannedWords= React.lazy(() => import('@/pages/admin/ManageBannedWords'));
const ViewLogs         = React.lazy(() => import('@/pages/admin/ViewLogs'));

// Moderator
const ModeratePosts      = React.lazy(() => import('@/pages/moderator/ModeratePosts'));
const ReportedPosts      = React.lazy(() => import('@/pages/moderator/ReportedPosts'));
const ModeratorDashboard = React.lazy(() => import('@/pages/moderator/Dashboard'));

// ─── Page Loading Fallback ───────────────────────────────────────
const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <span className="text-white font-black text-xl">F</span>
        </div>
        <div className="absolute inset-0 rounded-2xl animate-ping opacity-30"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
      </div>
      <div className="flex gap-1">
        {[0,1,2].map(i => (
          <span key={i} className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  </div>
);

// ─── Router ──────────────────────────────────────────────────────
const AppRoutes = () => (
  <Suspense fallback={<PageFallback />}>
    <Routes>
      {/* Public Routes */}
      <Route path="/login"        element={<LoginPage />} />
      <Route path="/register"     element={<RegisterPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/"             element={<Navigate to="/login" replace />} />

      {/* User Routes */}
      <Route element={<ProtectedRoute allowedRoles={['user']} />}>
        <Route path="/user" element={<UserLayout />}>
          <Route index              element={<UserHome />} />
          <Route path="saved"       element={<SavedPostsList />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="posts/:id"   element={<UserPostDetail />} />
          <Route path="profile/:userId" element={<Profile />} />
          <Route path="settings"    element={<Settings />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
      </Route>

      {/* Moderator Routes */}
      <Route path="/moderator" element={<ProtectedRoute allowedRoles={['moderator']} />}>
        <Route element={<ModeratorLayout />}>
          <Route index              element={<ModeratorDashboard />} />
          <Route path="moderate"    element={<ModeratePosts />} />
          <Route path="reports"     element={<ReportedPosts />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route index                element={<AdminDashboard />} />
          <Route path="users"         element={<ManageUsers />} />
          <Route path="categories"    element={<ManageCategories />} />
          <Route path="banned-words"  element={<ManageBannedWords />} />
          <Route path="logs"          element={<ViewLogs />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
