import React from 'react';
import useAuthStore from '../features/auth/store/authStore';
import Button from '../components/ui/Button';
import PostList from '../features/posts/components/PostList';
import { useNavigate } from 'react-router-dom';
import { LogOut, PenSquare, Search, Bell, Home, Hash, Award, Menu } from 'lucide-react';

const NavItem = ({ icon, label, active }) => {
    const Icon = icon;
    return (
        <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${active ? 'bg-primary-50 text-primary-700 font-bold' : 'hover:bg-slate-100 text-slate-600'}`}>
            <Icon className={`w-6 h-6 ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span className="text-base">{label}</span>
        </div>
    );
};

import useModalStore from '../components/hooks/useModalStore';

const HomePage = () => {
  const { user, logout } = useAuthStore();
  const { onOpen } = useModalStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
        {/* Modern Glassy Header */}
        <header className="fixed top-0 inset-x-0 h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-50">
            <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                {/* Logo Area */}
                <div className="flex items-center space-x-12">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                         <div className="h-10 w-10 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <span className="text-white font-extrabold text-xl">F</span>
                         </div>
                         <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 hidden sm:block">
                            Forum
                         </span>
                    </div>
                    {/* Search Bar - Hidden on mobile */}
                    <div className="hidden md:flex relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm bài viết..." 
                            className="bg-slate-100 border-none rounded-full py-2.5 pl-10 pr-4 w-72 text-sm focus:ring-2 focus:ring-primary-500/30 focus:bg-white transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-3">
                    {user ? (
                        <>
                            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                            <div className="flex items-center pl-2 space-x-3">
                                <span className="text-sm font-bold text-slate-700 hidden lg:block">
                                    {user.username}
                                </span>
                                <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white shadow-sm cursor-pointer hover:ring-primary-200 transition-all">
                                     <img src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} alt="Avatar" className="h-full w-full object-cover" />
                                </div>
                                <Button size="sm" variant="ghost" onClick={handleLogout} className="!p-2 text-slate-500 hover:text-red-600">
                                    <LogOut className="w-5 h-5" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center space-x-3">
                             <Button variant="ghost" className="font-semibold text-slate-600" onClick={() => navigate('/login')}>Đăng nhập</Button>
                             <Button className="rounded-full shadow-lg shadow-primary-500/30 px-6" onClick={() => navigate('/register')}>Đăng ký ngay</Button>
                        </div>
                    )}
                </div>
            </div>
        </header>

        <div className="grid grid-cols-12 max-w-7xl mx-auto pt-[90px] px-4 gap-8">
            {/* LEFT SIDEBAR (Sticky) */}
            <aside className="hidden lg:block col-span-3 sticky top-[90px] h-[calc(100vh-90px)]">
                <nav className="space-y-1">
                    <NavItem icon={Home} label="Trang chủ" active />
                    <NavItem icon={Hash} label="Khám phá" />
                    <NavItem icon={Award} label="Bảng xếp hạng" />
                    <div className="pt-6 pb-2">
                        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Danh mục</p>
                    </div>
                    <NavItem icon={Menu} label="Công nghệ" />
                    <NavItem icon={Menu} label="Đời sống" />
                </nav>
            </aside>

            {/* MAIN FEED */}
            <main className="col-span-12 lg:col-span-6 space-y-6 pb-20">
                {user && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                        <div className="flex space-x-4">
                            <div className="h-11 w-11 rounded-full bg-slate-100 flex-shrink-0">
                                <img src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                            </div>
                            <button 
                                onClick={() => onOpen('create-post')}
                                className="flex-1 text-left bg-slate-50 hover:bg-slate-100 text-slate-500 py-3 px-5 rounded-xl text-[15px] transition-all flex items-center shadow-inner"
                            >
                                <span>{user.username} ơi, bạn đang nghĩ gì thế?</span>
                                <PenSquare className="w-4 h-4 ml-auto opacity-50" />
                            </button>
                        </div>
                         {/* Quick Actions (Fake) */}
                         <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50 px-2">
                            <button className="flex items-center space-x-2 text-sm font-medium text-slate-500 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors">
                                <span className="text-green-500">📷</span> <span>Ảnh/Video</span>
                            </button>
                             <button className="flex items-center space-x-2 text-sm font-medium text-slate-500 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors">
                                <span className="text-yellow-500">😊</span> <span>Cảm xúc</span>
                            </button>
                        </div>
                    </div>
                )}
                
                <PostList />
            </main>

            {/* RIGHT SIDEBAR (Trending Tags/Suggestions) */}
            <aside className="hidden lg:block col-span-3 sticky top-[90px] h-[calc(100vh-90px)] space-y-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 text-lg">Chủ đề nổi bật</h3>
                    <div className="flex flex-wrap gap-2">
                        {['Javascript', 'ReactJS', 'Tuyển dụng', 'Drama', 'Review'].map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-lg cursor-pointer transition-colors border border-slate-200/50">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl p-5 shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Award className="w-24 h-24 rotate-12" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 relative z-10">Trở thành Premium</h3>
                    <p className="text-primary-100 text-sm mb-4 relative z-10">Mở khóa tính năng đăng bài không giới hạn và huy hiệu độc quyền.</p>
                    <button className="w-full py-2.5 bg-white text-primary-700 font-bold rounded-xl text-sm hover:bg-primary-50 transition-colors shadow-sm relative z-10">
                        Nâng cấp ngay
                    </button>
                </div>
            </aside>
        </div>
    </div>
  );
};

export default HomePage;
