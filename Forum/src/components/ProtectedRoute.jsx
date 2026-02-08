
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/features/auth/store/authStore';

const ProtectedRoute = ({ allowedRoles }) => {
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);

    console.log('[ProtectedRoute] Checking auth:', { 
        hasUser: !!user, 
        hasToken: !!token,
        userRole: user?.role,
        allowedRoles 
    });

    if (!token || !user) {
        console.warn('[ProtectedRoute] Redirecting to /login - Missing token or user');
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
