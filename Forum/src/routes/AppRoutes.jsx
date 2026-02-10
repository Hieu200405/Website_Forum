
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

// Layouts
import UserLayout from '@/layouts/UserLayout';
import AdminLayout from '@/layouts/AdminLayout';
import ModeratorLayout from '@/layouts/ModeratorLayout';

// Public Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import Unauthorized from '@/pages/auth/Unauthorized';

// User Pages
import UserHome from '@/pages/user/Home';
import UserPostDetail from '@/pages/user/PostDetail';
import CreatePost from '@/pages/user/CreatePost';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import ManageUsers from '@/pages/admin/ManageUsers';
import ManageCategories from '@/pages/admin/ManageCategories';
import ManageBannedWords from '@/pages/admin/ManageBannedWords';
import ViewLogs from '@/pages/admin/ViewLogs';

// Moderator Pages
import ModeratePosts from '@/pages/moderator/ModeratePosts';
import ReportedPosts from '@/pages/moderator/ReportedPosts';
import ModeratorDashboard from '@/pages/moderator/Dashboard';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 
         ROOT REDIRECT Logic:
         Accessing "/" should redirect to appropriate dashboard based on role?
         Or let "/" be User Home? 
         The prompt says:
         USER -> /user
         MODERATOR -> /moderator
         ADMIN -> /admin
         
         So I will make "/" verify role or redirect to Login.
         Or maybe "/" leads to a landing page?
         I'll redirect "/" to "/login" to force flow, or check role.
       */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* User Routes (Only User Role) */}
      <Route element={<ProtectedRoute allowedRoles={['user']} />}>
         <Route path="/user" element={<UserLayout />}>
            <Route index element={<UserHome />} />
            <Route path="create-post" element={<CreatePost />} />
            <Route path="posts/:id" element={<UserPostDetail />} />
         </Route>
      </Route>

      {/* Moderator Routes (Only Moderator Role) */}
      <Route path="/moderator" element={<ProtectedRoute allowedRoles={['moderator']} />}>
          <Route element={<ModeratorLayout />}>
              <Route index element={<ModeratorDashboard />} />
              <Route path="moderate" element={<ModeratePosts />} />
              <Route path="reports" element={<ReportedPosts />} />
          </Route>
      </Route>

      {/* Admin Routes (Only Admin Role) */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="categories" element={<ManageCategories />} />
              <Route path="banned-words" element={<ManageBannedWords />} />
              <Route path="logs" element={<ViewLogs />} />
          </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
