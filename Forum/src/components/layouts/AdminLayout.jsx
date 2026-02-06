import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import useAuthStore from '@/features/auth/store/authStore';
import { LayoutDashboard, Users, FileText, Ban, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminLayout = () => {
    const { user, logout, isAuthenticated } = useAuthStore();
    const location = useLocation();

    // 1. Check Auth & Role
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!['admin', 'moderator'].includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Quản lý người dùng', path: '/admin/users', roles: ['admin'] },
        { icon: FileText, label: 'Quản lý nội dung', path: '/admin/posts', roles: ['admin', 'moderator'] },
        { icon: Ban, label: 'Báo cáo vi phạm', path: '/admin/reports', roles: ['admin', 'moderator'] },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-50">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center font-bold">F</div>
                        <span className="text-xl font-bold tracking-tight">Forum Admin</span>
                    </Link>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        if (item.roles && !item.roles.includes(user.role)) return null;
                        
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path}
                                className={cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                    isActive 
                                        ? "bg-primary-600 text-white shadow-md shadow-primary-900/20" 
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </div>

                {/* Footer User Info */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center space-x-3 mb-4 px-2">
                        <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center">
                            <span className="font-bold text-xs">{user.username[0].toUpperCase()}</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">{user.username}</p>
                            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => logout()}
                        className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
