import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RequireRole from './features/auth/components/RequireRole';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';

import ModalProvider from './components/providers/ModalProvider';

const queryClient = new QueryClient();

import PostDetailPage from './pages/PostDetailPage';

// ...

import AdminLayout from '@/components/layouts/AdminLayout';
import UserLayout from '@/components/layouts/UserLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import CategoryManagement from '@/pages/admin/CategoryManagement';
import ReportManagement from '@/pages/admin/ReportManagement';

// ...

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}

          <Route element={<UserLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
          </Route>
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<RequireRole roles={['admin']}><UserManagement /></RequireRole>} />
              <Route path="categories" element={<RequireRole roles={['admin']}><CategoryManagement /></RequireRole>} />
              <Route path="reports" element={<ReportManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ModalProvider />
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
