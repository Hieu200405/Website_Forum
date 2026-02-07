
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/features/auth/store/authStore';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated, token } = useAuthStore();

    if (!isAuthenticated || !token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
