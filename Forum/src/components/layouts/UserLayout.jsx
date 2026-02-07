
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/features/auth/store/authStore';

const UserLayout = () => {
    const { user } = useAuthStore();

    // Prevent Admin/Moderator from accessing User Layout pages
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
        return <Navigate to="/admin" replace />;
    }

    return (
        <div className="user-layout">
            {/* Common User Navbar could go here if extracted from HomePage */}
            <Outlet />
        </div>
    );
};

export default UserLayout;
