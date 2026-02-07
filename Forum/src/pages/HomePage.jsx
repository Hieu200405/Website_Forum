import React from 'react';
import useAuthStore from '../features/auth/store/authStore';
import Button from '../components/ui/Button';
import PostList from '../features/posts/components/PostList';
import { useNavigate } from 'react-router-dom';
import { LogOut, PenSquare, Search, Bell, Home, Hash, Award, Menu, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/features/categories/api/categoryService';
import { getPosts } from '@/features/posts/api/postService';
import useModalStore from '../components/hooks/useModalStore';

const NavItem = ({ icon, label, active, onClick }) => {
    const Icon = icon;
    return (
        <div 
            onClick={onClick}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${active ? 'bg-primary-50 text-primary-700 font-bold' : 'hover:bg-slate-100 text-slate-600'}`}
        >
            <Icon className={`w-6 h-6 ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span className="text-base">{label}</span>
        </div>
    );
};

const HomePage = () => {
  const { user, logout } = useAuthStore();
  const { onOpen } = useModalStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  React.useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'moderator')) {
        navigate('/admin');
    }
  }, [user, navigate]);

  // 1. Fetch Categories
  const { data: categories = [] } = useQuery({
      queryKey: ['categories'],
      queryFn: getCategories
  });

  // 2. Fetch Trending Posts (Most Liked)
  const { data: trendingData } = useQuery({
      queryKey: ['posts', 'trending'],
      queryFn: () => getPosts({ sort: 'most_liked', limit: 5 }),
  });
  const trendingPosts = trendingData?.data || [];

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
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-3">
                    {user ? (
                        <>
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
            <aside className="hidden lg:block col-span-3 sticky top-[90px] h-[calc(100vh-90px)] overflow-y-auto custom-scrollbar pr-2">
                <nav className="space-y-1">
                    <NavItem icon={Home} label="Trang chủ" active onClick={() => navigate('/')} />
                    <div className="pt-6 pb-2">
                        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Danh mục</p>
                    </div>
                    {categories.length > 0 ? categories.map(cat => (
                        <NavItem 
                            key={cat.id} 
                            icon={Hash} 
                            label={cat.name} 
                            onClick={() => { /* Filter by category logic later */ }}
                        />
                    )) : (
                        <div className="px-4 text-sm text-slate-400 italic">Chưa có danh mục</div>
                    )}
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
                    </div>
                )}
                
                <PostList />
            </main>

            {/* RIGHT SIDEBAR (Trending Posts) */}
            <aside className="hidden lg:block col-span-3 sticky top-[90px] h-[calc(100vh-90px)] space-y-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-600" />
                        Nổi bật nhất
                    </h3>
                    <div className="space-y-4">
                        {trendingPosts.length > 0 ? trendingPosts.map(post => (
                            <div key={post.id} className="group cursor-pointer" onClick={() => navigate(`/posts/${post.id}`)}>
                                <h4 className="font-medium text-slate-700 group-hover:text-primary-600 text-[15px] leading-snug line-clamp-2 transition-colors">
                                    {post.title}
                                </h4>
                                <div className="flex items-center text-xs text-slate-400 mt-2 space-x-2">
                                     <span>{post.author?.username}</span>
                                     <span>•</span>
                                     <span className="flex items-center text-rose-500 font-medium">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        {post.likeCount}
                                     </span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-400 text-sm">Chưa có bài viết nổi bật</p>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    </div>
  );
};

export default HomePage;
