
import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/features/auth/store/authStore';
import { ShieldCheck, Flag, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const ModeratorLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/moderator', label: 'Tổng quan', icon: LayoutDashboard },
        { path: '/moderator/moderate', label: 'Duyệt bài', icon: ShieldCheck },
        { path: '/moderator/reports', label: 'Xem bài bị report', icon: Flag },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-50">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center font-bold">M</div>
                        <span className="text-lg font-bold tracking-tight">Mod Panel</span>
                    </div>
                </div>
                
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {menuItems.map((item) => {
                         const isActive = location.pathname === item.path || (item.path !== '/moderator' && location.pathname.startsWith(item.path));
                         const Icon = item.icon;
                         return (
                            <Link 
                                key={item.path}
                                to={item.path} 
                                className={cn(
                                    "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                    isActive 
                                        ? "bg-green-600 text-white shadow-md shadow-green-900/20" 
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </Link>
                         );
                    })}
                </nav>
                
                <div className="p-4 border-t border-slate-800">
                     <div className="flex items-center space-x-3 mb-4 px-2">
                        <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                             <img src={`https://ui-avatars.com/api/?name=${user?.username}&background=random`} alt="Avatar" className="h-full w-full object-cover" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                            <p className="text-xs text-slate-500 uppercase">Moderator</p>
                        </div>
                     </div>
                     <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm transition-colors"
                     >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                     </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ModeratorLayout;
