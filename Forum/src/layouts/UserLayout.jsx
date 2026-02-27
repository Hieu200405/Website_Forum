
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@/features/auth/store/authStore';
import { Home, PlusSquare, LogOut, User as UserIcon, Settings2 } from 'lucide-react';
import NotificationDropdown from '@/features/notifications/components/NotificationDropdown';

const UserLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/user" className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <span className="text-white font-extrabold text-lg">F</span>
                         </div>
                        <span className="text-xl font-bold text-slate-800">Forum User</span>
                    </Link>
                    
                    <nav className="hidden md:flex items-center space-x-1">
                        <Link to="/user" className="flex items-center space-x-1 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors font-medium">
                             <Home className="w-5 h-5" />
                             <span>Trang chủ</span>
                        </Link>
                        {/* "Tạo bài viết" using modal trigger to utilize CreatePostModal with Cloudinary */}
                        <button onClick={() => {
                            import('@/components/hooks/useModalStore').then(({ default: useModal }) => {
                                useModal.getState().onOpen('create-post');
                            });
                        }} className="flex items-center space-x-1 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors font-medium">
                             <PlusSquare className="w-5 h-5" />
                             <span>Tạo bài viết</span>
                        </button>
                    </nav>

                    <div className="flex items-center space-x-4">
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="hidden sm:inline-block text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-100">
                                Trang Quản Trị
                            </Link>
                        )}
                        {user?.role === 'moderator' && (
                            <Link to="/moderator" className="hidden sm:inline-block text-sm font-bold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors border border-green-100">
                                Trang Kiểm Duyệt
                            </Link>
                        )}
                        <NotificationDropdown />
                        <Link to={`/user/profile/${user?.id}`} className="flex items-center space-x-2 group">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-primary-400 transition">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                ) : user?.username ? (
                                    <img src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <UserIcon className="w-5 h-5 text-slate-400" />
                                )}
                            </div>
                            <span className="text-sm font-medium text-slate-700 hidden sm:block group-hover:text-primary-600 transition">{user?.username}</span>
                        </Link>
                        <button onClick={handleLogout} className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-slate-100" title="Đăng xuất">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;
