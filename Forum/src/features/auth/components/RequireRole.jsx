
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const RequireRole = ({ roles, children }) => {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user && !roles.includes(user.role)) {
        // Redirect to admin dashboard if authorized, else home
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default RequireRole;
