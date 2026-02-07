
import React from 'react';
import useAuthStore from '@/features/auth/store/authStore';
import PostList from '@/features/posts/components/PostList';
import { useNavigate } from 'react-router-dom';
import { Home, Hash, TrendingUp, PenSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/features/categories/api/categoryService';
import { getPosts } from '@/features/posts/api/postService';

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

const UserHome = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

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
    <div className="grid grid-cols-12 gap-8">
        {/* LEFT SIDEBAR (Sticky) */}
        <aside className="hidden lg:block col-span-3 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar pr-2">
            <nav className="space-y-1">
                <NavItem icon={Home} label="Bảng tin" active onClick={() => navigate('/user')} />
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
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 transition-all hover:shadow-md cursor-pointer" onClick={() => navigate('/user/create-post')}>
                    <div className="flex space-x-4">
                        <div className="h-11 w-11 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
                             <img src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} alt="Avatar" className="h-full w-full object-cover" />
                        </div>
                        <div 
                            className="flex-1 text-left bg-slate-50 hover:bg-slate-100 text-slate-500 py-3 px-5 rounded-xl text-[15px] transition-all flex items-center shadow-inner"
                        >
                            <span>{user.username} ơi, bạn đang nghĩ gì thế?</span>
                            <PenSquare className="w-4 h-4 ml-auto opacity-50" />
                        </div>
                    </div>
                </div>
            )}
            
            <PostList />
        </main>

        {/* RIGHT SIDEBAR (Trending Posts) */}
        <aside className="hidden lg:block col-span-3 sticky top-24 h-[calc(100vh-6rem)] space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                    Nổi bật nhất
                </h3>
                <div className="space-y-4">
                    {trendingPosts.length > 0 ? trendingPosts.map(post => (
                        <div key={post.id} className="group cursor-pointer" onClick={() => navigate(`/user/posts/${post.id}`)}>
                            <h4 className="font-medium text-slate-700 group-hover:text-primary-600 text-[15px] leading-snug line-clamp-2 transition-colors">
                                {post.title}
                            </h4>
                            <div className="flex items-center text-xs text-slate-400 mt-2 space-x-2">
                                    <span>{post.author?.username}</span>
                                    <span>•</span>
                                    <span className="flex items-center text-rose-500 font-medium">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {post.like_count || post.likeCount || 0}
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
  );
};

export default UserHome;
