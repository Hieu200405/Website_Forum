
import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/features/auth/store/authStore';
import { LayoutDashboard, Users, FileText, Ban, LogOut, AlertTriangle, ChevronLeft, Activity, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',   path: '/admin' },
    { icon: Users,           label: 'Người dùng',  path: '/admin/users' },
    { icon: FileText,        label: 'Danh mục',    path: '/admin/categories' },
    { icon: Ban,             label: 'Từ cấm',      path: '/admin/banned-words' },
    { icon: AlertTriangle,   label: 'Nhật ký',     path: '/admin/logs' },
];

// ─── Sidebar content declared OUTSIDE AdminLayout to avoid "component during render" error ───
const SidebarContent = ({ user, pathname, onClose, onLogout }) => (
    <>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/10">
            <div className="flex items-center gap-3">
                <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-white text-lg"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}
                >
                    A
                </div>
                <div>
                    <div className="text-sm font-black text-white leading-tight">Admin Panel</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">ForumHub</div>
                </div>
            </div>
        </div>

        {/* Nav */}
        <div className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
            <p className="px-3 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 mt-1">Quản lý</p>
            {menuItems.map(item => {
                const isActive = item.path === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
                            isActive
                                ? 'bg-white/15 text-white shadow-inner'
                                : 'text-slate-400 hover:text-white hover:bg-white/10'
                        )}
                    >
                        <div className={cn('p-1.5 rounded-lg', isActive ? 'bg-white/20' : 'bg-white/5')}>
                            <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span>{item.label}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                    </Link>
                );
            })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
            {/* User chip */}
            <div className="flex items-center gap-2.5 bg-white/8 rounded-xl px-3 py-2.5 mb-2">
                <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=ef4444&color=fff&bold=true`}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20"
                    alt=""
                />
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{user?.username}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Administrator</div>
                </div>
            </div>
            <Link
                to="/user"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-white/15 text-slate-300 hover:bg-white/10 hover:text-white text-xs font-semibold transition-all"
            >
                <ChevronLeft className="w-3.5 h-3.5" /> Quay lại Forum
            </Link>
            <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-400 hover:bg-red-500/20 hover:text-red-400 text-xs font-semibold transition-all"
            >
                <LogOut className="w-3.5 h-3.5" /> Đăng xuất
            </button>
        </div>
    </>
);

// ─── Main layout ─────────────────────────────────────────────────
const AdminLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };
    const closeMobile = () => setMobileOpen(false);

    const sidebarProps = {
        user,
        pathname: location.pathname,
        onClose: closeMobile,
        onLogout: handleLogout,
    };

    const SIDEBAR_GRADIENT = 'linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%)';

    return (
        <div className="min-h-screen flex font-sans" style={{ background: '#f3f4f8' }}>
            {/* Desktop Sidebar */}
            <aside
                className="hidden md:flex w-60 flex-col fixed inset-y-0 left-0 z-50"
                style={{ background: SIDEBAR_GRADIENT }}
            >
                <SidebarContent {...sidebarProps} />
            </aside>

            {/* Mobile Sidebar overlay */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-black/50" onClick={closeMobile} />
                    <aside
                        className="relative w-60 flex flex-col h-full z-10"
                        style={{ background: SIDEBAR_GRADIENT }}
                    >
                        <button
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                            onClick={closeMobile}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <SidebarContent {...sidebarProps} />
                    </aside>
                </div>
            )}

            {/* Main content */}
            <main className="flex-1 md:ml-60 min-h-screen">
                {/* Topbar */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 h-14 flex items-center px-6 gap-4 shadow-sm">
                    <button
                        className="md:hidden text-slate-500 hover:text-slate-800 transition-colors"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                        <Activity className="w-4 h-4 text-red-500" />
                        <span>Admin Control Panel</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Hệ thống bình thường
                    </div>
                </header>

                <div className="p-6 max-w-7xl mx-auto fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
