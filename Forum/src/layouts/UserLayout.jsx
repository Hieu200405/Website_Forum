import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/features/auth/store/authStore';
import { Home, PlusSquare, LogOut, User as UserIcon, Trophy, Zap, Bookmark } from 'lucide-react';
import NotificationDropdown from '@/features/notifications/components/NotificationDropdown';

const UserLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen font-sans" style={{ background: 'var(--bg-base, #f3f4f8)' }}>
            {/* ─────────────── HEADER ─────────────── */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/50 border-b border-slate-200/60'
                    : 'bg-white/80 backdrop-blur-md border-b border-slate-100'
            }`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    
                    {/* Logo */}
                    <Link to="/user" className="flex items-center gap-2.5 shrink-0">
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            <span className="text-white font-black text-lg leading-none">F</span>
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-base font-extrabold gradient-text tracking-tight">ForumHub</span>
                        </div>
                    </Link>

                    {/* Center Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink to="/user" active={isActive('/user')} icon={<Home size={16} />} label="Bảng tin" />
                        <button
                            onClick={() => import('@/components/hooks/useModalStore').then(({ default: useModal }) => useModal.getState().onOpen('create-post'))}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-md hover:shadow-primary-500/30 hover:-translate-y-0.5 ml-1"
                        >
                            <PlusSquare size={15} />
                            <span>Đăng bài</span>
                        </button>
                        <NavLink to="/user/leaderboard" active={isActive('/user/leaderboard')} icon={<Trophy size={16} />} label="Phong Thần" highlight />
                        <NavLink to="/user/saved" active={isActive('/user/saved')} icon={<Bookmark size={16} />} label="Đã lưu" />
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {user?.role === 'admin' && (
                            <Link to="/admin"
                                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-100">
                                <Zap size={12} />
                                Admin
                            </Link>
                        )}
                        {user?.role === 'moderator' && (
                            <Link to="/moderator"
                                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100">
                                <Zap size={12} />
                                Kiểm duyệt
                            </Link>
                        )}

                        <NotificationDropdown />

                        <Link to={`/user/profile/${user?.id}`}
                            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full hover:bg-slate-100 transition-all group">
                            <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-primary-300/50 group-hover:ring-primary-400 transition shadow-sm">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                ) : user?.username ? (
                                    <img src={`https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&bold=true`} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <UserIcon className="w-5 h-5 text-slate-400" />
                                )}
                            </div>
                            <div className="hidden sm:block text-left">
                                <div className="text-xs font-bold text-slate-800 leading-tight">{user?.username}</div>
                                <div className="text-[10px] text-slate-400 font-medium capitalize">{user?.role || 'Thành viên'}</div>
                            </div>
                        </Link>

                        <button
                            onClick={handleLogout}
                            title="Đăng xuất"
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile bottom nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 flex justify-around items-center h-16 shadow-lg shadow-slate-300/20">
                <MobileNavLink to="/user" icon={<Home size={20} />} label="Trang chủ" active={isActive('/user')} />
                <button
                    onClick={() => import('@/components/hooks/useModalStore').then(({ default: useModal }) => useModal.getState().onOpen('create-post'))}
                    className="flex flex-col items-center gap-0.5 p-2 rounded-xl text-white w-14 h-12 items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    <PlusSquare size={20} />
                </button>
                <MobileNavLink to="/user/leaderboard" icon={<Trophy size={20} />} label="Top" active={isActive('/user/leaderboard')} />
                <MobileNavLink to={`/user/profile/${user?.id}`} icon={<UserIcon size={20} />} label="Tôi" active={false} />
            </nav>

            {/* Main content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6 fade-in">
                <Outlet />
            </main>
        </div>
    );
};

const NavLink = ({ to, active, icon, label, highlight }) => (
    <Link
        to={to}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            active
                ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-100'
                : highlight
                    ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
        {icon}
        <span>{label}</span>
    </Link>
);

const MobileNavLink = ({ to, icon, label, active }) => (
    <Link to={to} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${active ? 'text-primary-600' : 'text-slate-400'}`}>
        {icon}
        <span>{label}</span>
    </Link>
);

export default UserLayout;
