
import React, { useState, useEffect } from 'react';
import useAuthStore from '@/features/auth/store/authStore';
import PostList from '@/features/posts/components/PostList';
import { useNavigate } from 'react-router-dom';
import { Home, Hash, TrendingUp, PenSquare, Bookmark, Search, Sparkles, Users, Flame, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/features/categories/api/categoryService';
import { getPosts } from '@/features/posts/api/postService';
import { Helmet } from 'react-helmet-async';

const NavItem = ({ icon, label, active, onClick, count }) => {
    const Icon = icon;
    return (
        <div
            onClick={onClick}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                active
                    ? 'nav-active text-primary-700 font-semibold'
                    : 'hover:bg-white hover:shadow-sm text-slate-600'
            }`}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="text-sm">{label}</span>
            </div>
            {count !== undefined && (
                <span className="text-xs bg-primary-100 text-primary-700 font-bold px-2 py-0.5 rounded-full">{count}</span>
            )}
        </div>
    );
};

const UserHome = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    useEffect(() => {
        const fn = setTimeout(() => setSearchQuery(searchInput), 400);
        return () => clearTimeout(fn);
    }, [searchInput]);

    const { data: categoriesResponse = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
    const categoriesRaw = Array.isArray(categoriesResponse) ? categoriesResponse : categoriesResponse?.data || [];
    const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];
    const { data: trendingData } = useQuery({
        queryKey: ['posts', 'trending'],
        queryFn: () => getPosts({ sort: 'most_liked', limit: 5 }),
    });
    const trendingPosts = trendingData?.data || [];

    return (
        <div className="grid grid-cols-12 gap-6">
            <Helmet>
                <title>Bảng tin | ForumHub - Chia sẻ kiến thức trực tuyến</title>
                <meta name="description" content="ForumHub - Không gian thảo luận sôi nổi, chia sẻ kiến thức lập trình, công nghệ và đời sống dành cho giới trẻ." />
                <meta property="og:title" content="Bảng tin | ForumHub" />
                <meta property="og:description" content="Khám phá các bài viết và chủ đề nóng hổi nhất trên ForumHub." />
            </Helmet>

            {/* ─────── LEFT SIDEBAR ─────── */}
            <aside className="hidden lg:flex lg:col-span-3 flex-col gap-3">
                <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm sticky top-24">
                    <nav className="space-y-0.5">
                        <NavItem icon={Home} label="Bảng tin" active={!selectedCategoryId} onClick={() => setSelectedCategoryId(null)} />
                        <NavItem icon={Bookmark} label="Bài đã lưu" onClick={() => navigate('/user/saved')} />
                    </nav>

                    <div className="my-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chuyên mục</p>
                    <nav className="space-y-0.5">
                        {categories.length > 0 ? categories.map(cat => (
                            <NavItem
                                key={cat.id}
                                icon={Hash}
                                label={cat.name}
                                active={selectedCategoryId === cat.id}
                                onClick={() => setSelectedCategoryId(cat.id)}
                            />
                        )) : (
                            <div className="px-3 text-sm text-slate-400 italic py-2">Chưa có danh mục</div>
                        )}
                    </nav>

                    <div className="my-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    {/* Online stats box */}
                    <div className="px-3 py-3 rounded-xl bg-gradient-to-br from-primary-50 to-violet-50 border border-primary-100">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
                            <span className="text-xs font-bold text-slate-700">Đang trực tuyến</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-primary-500" />
                            <span className="text-sm font-semibold text-primary-700">Cộng đồng đang sôi nổi!</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ─────── MAIN FEED ─────── */}
            <main className="col-span-12 lg:col-span-6 space-y-5">
                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none" />
                    <input
                        type="text"
                        className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all font-medium text-slate-700"
                        placeholder="Tìm kiếm bài viết, chủ đề, tác giả..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                    />
                    {searchInput && (
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            onClick={() => setSearchInput('')}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Create post prompt */}
                {user && (
                    <div
                        className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-primary-200/60 transition-all cursor-pointer group"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                        onClick={() => import('@/components/hooks/useModalStore').then(({ default: useModal }) => useModal.getState().onOpen('create-post'))}
                    >
                        <div className="flex gap-3 items-center">
                            <div className="h-10 w-10 rounded-full ring-2 ring-primary-100 shrink-0 overflow-hidden">
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&bold=true`}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 flex items-center justify-between bg-slate-50 group-hover:bg-primary-50/50 border border-slate-200 group-hover:border-primary-200 rounded-xl px-4 py-3 transition-all">
                                <span className="text-sm text-slate-400 group-hover:text-primary-500 font-medium transition-colors">
                                    {user.username}, bạn muốn chia sẻ điều gì?
                                </span>
                                <span className="flex items-center gap-1 text-xs font-bold text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PenSquare className="w-3.5 h-3.5" />
                                    Đăng bài
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <PostList searchQuery={searchQuery} categoryId={selectedCategoryId} />
            </main>

            {/* ─────── RIGHT SIDEBAR ─────── */}
            <aside className="hidden lg:flex lg:col-span-3 flex-col gap-4 sticky top-24 h-fit">
                {/* Trending */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                        <div className="p-1.5 bg-amber-100 rounded-lg">
                            <Flame className="w-4 h-4 text-amber-500" />
                        </div>
                        Nổi bật nhất
                    </h3>
                    <div className="space-y-3">
                        {trendingPosts.length > 0 ? trendingPosts.map((post, i) => (
                            <div
                                key={post.id}
                                onClick={() => navigate(`/user/posts/${post.id}`)}
                                className="group flex items-start gap-3 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-colors"
                            >
                                <span className={`shrink-0 text-[10px] font-black w-5 h-5 rounded-lg flex items-center justify-center mt-0.5 ${
                                    i === 0 ? 'bg-amber-100 text-amber-700' :
                                    i === 1 ? 'bg-slate-200 text-slate-600' :
                                    i === 2 ? 'bg-orange-100 text-orange-700' :
                                    'bg-slate-100 text-slate-500'
                                }`}>
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-700 group-hover:text-primary-600 line-clamp-2 leading-snug transition-colors">
                                        {post.title}
                                    </h4>
                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                                        <span className="text-red-400 font-semibold">❤ {Number(post.likeCount ?? 0)}</span>
                                        <span>·</span>
                                        <span
                                            className="hover:text-primary-600 hover:underline cursor-pointer transition-colors"
                                            onClick={e => { e.stopPropagation(); navigate(`/user/profile/${post.author?.id}`); }}
                                        >
                                            {post.author?.username}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-400 text-sm text-center py-4">Chưa có bài nổi bật</p>
                        )}
                    </div>
                </div>

                {/* CTA Banner */}
                <div className="rounded-2xl p-5 text-white relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a855f7 100%)' }}>
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                    <div className="relative z-10">
                        <Sparkles className="w-7 h-7 text-yellow-300 mb-3" />
                        <h3 className="font-bold text-lg mb-1 leading-tight">Trở thành Huyền thoại</h3>
                        <p className="text-primary-100 text-xs mb-4 leading-relaxed">Đăng bài & nhận Like để tích lũy điểm uy tín và leo top Bảng Phong Thần.</p>
                        <button
                            onClick={() => navigate('/user/leaderboard')}
                            className="text-xs font-bold bg-white text-primary-700 px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors shadow-md"
                        >
                            Xem Bảng Phong Thần →
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default UserHome;
