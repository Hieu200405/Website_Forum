import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPosts } from '@/features/posts/api/postService';
import api from '@/lib/axios';
import { Calendar, FileText, Loader2, Info, Trash2, Pencil, Settings2, Users, Heart, MessageSquare, Zap, Star, Flame, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import useAuthStore from '@/features/auth/store/authStore';
import { useDeletePost } from '@/features/posts/hooks/useDeletePost';
import useModalStore from '@/components/hooks/useModalStore';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const getUserProfile = async (id) => {
    const response = await api.get(`/users/${id}/profile`);
    return response.data;
};

const getBadge = (rep) => {
    if (rep >= 1000) return { label: 'Huyền thoại', emoji: '🌟', gradient: 'from-purple-500 via-pink-500 to-amber-400', text: 'text-white' };
    if (rep >= 500)  return { label: 'Chuyên gia',  emoji: '🔥', gradient: 'from-blue-500 to-cyan-500',                text: 'text-white' };
    if (rep >= 100)  return { label: 'Đóng góp tích cực', emoji: '⭐', gradient: 'from-green-500 to-emerald-500',     text: 'text-white' };
    if (rep >= 10)   return { label: 'Thành viên', emoji: '🌱', gradient: 'from-orange-400 to-amber-400',             text: 'text-white' };
    return           { label: 'Tân binh',    emoji: '✨', gradient: 'from-slate-400 to-slate-500',                     text: 'text-white' };
};

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    const { data: user, isLoading: userLoading, error: userError, refetch: refetchUser } = useQuery({
        queryKey: ['user-profile', userId],
        queryFn: () => getUserProfile(userId),
        retry: false,
        enabled: !!userId
    });

    const { data: postsResponse, isLoading: postsLoading } = useQuery({
        queryKey: ['posts', 'user', userId],
        queryFn: () => getPosts({ authorId: userId, limit: 100 }),
        enabled: !!userId
    });

    const { user: currentUser } = useAuthStore();
    const isOwnProfile = currentUser && String(currentUser.id) === String(userId);

    const deleteMutation = useDeletePost();
    const { onOpen } = useModalStore();

    const followMutation = useMutation({
        mutationFn: async () => { await api.post(`/users/${userId}/follow`); },
        onSuccess: () => { 
            toast.success(`Đã theo dõi ${user?.username || 'người dùng'}`); 
            refetchUser(); 
        },
        onError: err => toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra')
    });

    const unfollowMutation = useMutation({
        mutationFn: async () => { await api.post(`/users/${userId}/unfollow`); },
        onSuccess: () => { 
            toast.success(`Đã bỏ theo dõi ${user?.username}`); 
            refetchUser(); 
        },
        onError: err => toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra')
    });

    let posts = [];
    if (postsResponse?.data?.data && Array.isArray(postsResponse.data.data)) posts = postsResponse.data.data;
    else if (postsResponse?.data && Array.isArray(postsResponse.data)) posts = postsResponse.data;

    if (userLoading) return (
        <div className="max-w-5xl mx-auto pb-20 fade-in animate-pulse">
            <Helmet>
                <title>Đang tải hồ sơ... | ForumHub</title>
            </Helmet>
            <div className="h-44 rounded-3xl bg-slate-200 mt-2" />
            <div className="bg-white rounded-3xl -mt-12 mx-4 shadow-xl border border-slate-100 p-6 flex flex-col sm:flex-row gap-5">
                <div className="w-28 h-28 rounded-2xl bg-slate-300 shrink-0 border-4 border-white" />
                <div className="flex-1 space-y-4 pt-2">
                    <div className="h-6 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="flex gap-4 mt-6">
                        <div className="h-10 bg-slate-100 rounded-xl w-24" />
                        <div className="h-10 bg-slate-100 rounded-xl w-24" />
                    </div>
                </div>
            </div>
        </div>
    );

    if (userError || !user) return (
        <div className="max-w-md mx-auto mt-16 text-center">
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
                <Info className="w-14 h-14 mx-auto mb-4 text-red-400" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy người dùng</h2>
                <p className="text-sm text-slate-500 mb-6">Người dùng này có thể không tồn tại hoặc đã bị xóa.</p>
                <button onClick={() => navigate('/user')} className="px-6 py-2.5 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                    ← Quay về trang chủ
                </button>
            </div>
        </div>
    );

    const rep = user.reputation || 0;
    const badge = getBadge(rep);
    const avatarSrc = user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&bold=true&size=128`;

    return (
        <div className="max-w-5xl mx-auto pb-20 px-4 sm:px-6 fade-in">
            <Helmet>
                <title>{user.username} | Hồ sơ cá nhân - ForumHub</title>
                <meta name="description" content={`Xem hồ sơ của ${user.username} trên ForumHub - thành viên nổi bật với ${rep} điểm uy tín`} />
                <meta property="og:title" content={`${user.username} | ForumHub`} />
                <meta property="og:description" content={`Thành viên nổi bật - ${badge.label} với ${rep} điểm uy tín`} />
                <meta property="og:image" content={avatarSrc} />
            </Helmet>

            {/* ─── Hero Banner ─── */}
            <div className="relative h-40 sm:h-52 rounded-3xl overflow-hidden mt-4 shadow-inner"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)' }}>
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute top-4 right-6 flex gap-2 opacity-40">
                    {[...Array(3)].map((_, i) => <Star key={i} className="w-5 h-5 text-white fill-current" />)}
                </div>
            </div>

            {/* ─── Profile block ─── */}
            <div className="relative z-10 bg-white rounded-3xl -mt-16 sm:-mt-20 mx-2 sm:mx-6 shadow-2xl border border-slate-100 p-5 sm:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    {/* Avatar Container */}
                    <div className="relative shrink-0">
                        <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl border-4 border-transparent bg-gradient-to-br ${badge.gradient} transition-transform hover:scale-[1.02] duration-300`}>
                            <img src={avatarSrc} alt={user.username} className="w-full h-full object-cover" />
                        </div>
                        {/* Rank badge */}
                        <div className={`absolute -bottom-3 -right-3 bg-gradient-to-r ${badge.gradient} text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-white whitespace-nowrap z-20`}>
                            {badge.emoji} {badge.label}
                        </div>
                    </div>

                    {/* Info Container */}
                    <div className="flex-1 w-full min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight truncate">{user.username}</h1>
                                    {user.role === 'admin' && <Trophy className="w-5 h-5 text-amber-500 shrink-0" />}
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{user.role}</p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex shrink-0">
                                {isOwnProfile ? (
                                    <button onClick={() => navigate('/user/settings')}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-50 hover:bg-primary-50 text-slate-600 hover:text-primary-700 border border-slate-200 hover:border-primary-300 font-bold text-sm rounded-xl transition-all shadow-sm">
                                        <Settings2 className="w-4 h-4" />
                                        Chỉnh sửa hồ sơ
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => user.isFollowing ? unfollowMutation.mutate() : followMutation.mutate()}
                                        disabled={followMutation.isPending || unfollowMutation.isPending}
                                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-2.5 font-bold text-sm rounded-xl transition-all shadow-md group ${
                                            user.isFollowing
                                                ? 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-200 shadow-none'
                                                : 'text-white shadow-primary-500/30 hover:-translate-y-0.5 hover:shadow-lg'
                                        }`}
                                        style={!user.isFollowing ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}
                                    >
                                        {followMutation.isPending || unfollowMutation.isPending
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : user.isFollowing ? <Users className="w-4 h-4 group-hover:hidden" /> : <Users className="w-4 h-4" />
                                        }
                                        {user.isFollowing ? 'Bỏ theo dõi' : 'Follow ngay'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Bio Section */}
                        <div className="mt-5 relative">
                            <Info className="absolute -left-0 top-0.5 w-4 h-4 text-slate-300 hidden sm:block" />
                            <p className="text-[14px] text-slate-600 sm:pl-6 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                                {user.bio || <span className="italic text-slate-400">Người dùng này khá bí ẩn và chưa viết tiểu sử.</span>}
                            </p>
                        </div>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary-400" />
                                Gia nhập {user.created_at ? format(new Date(user.created_at), 'MMMM yyyy', { locale: vi }) : 'Gần đây'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats row - More stable grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-100">
                    <StatBox label="Bài thảo luận" value={user.postCount || 0} icon={<FileText className="w-4 h-4 text-indigo-500" />} />
                    <StatBox label="Người theo dõi" value={user.followerCount || 0} icon={<Users className="w-4 h-4 text-violet-500" />} />
                    <StatBox label="Đang theo dõi" value={user.followingCount || 0} icon={<Heart className="w-4 h-4 text-rose-500" />} />
                    <StatBox label="Điểm uy tín" value={rep} icon={<Zap className="w-4 h-4 text-amber-500" />} highlight />
                </div>
            </div>

            {/* ─── Posts Section ─── */}
            <div className="mt-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 rounded-xl text-primary-500">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h2 className="font-black text-slate-800 tracking-tight">Bộ sưu tập bài viết</h2>
                    </div>
                    <div className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                        TỔNG {posts.length}
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {postsLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                            <p className="text-sm font-bold text-slate-400">Đang tìm kiếm bài viết...</p>
                        </div>
                    ) : posts.length > 0 ? (
                        posts.map(post => (
                            <div
                                key={post.id}
                                onClick={() => navigate(`/user/posts/${post.id}`)}
                                className="group px-6 sm:px-8 py-5 hover:bg-slate-50/80 cursor-pointer transition-all flex items-center gap-4 sm:gap-6"
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-extrabold text-slate-800 text-[16px] group-hover:text-primary-600 transition-colors truncate mb-1.5">{post.title}</h3>
                                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold">
                                        <span className="bg-primary-50 text-primary-600 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                            {post.category || 'Chung'}
                                        </span>
                                        <span className="text-slate-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(post.createdAt), 'dd/MM/yyyy')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="hidden sm:flex items-center gap-4">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-black text-rose-500">{post.likeCount || 0}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Like</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-black text-indigo-500">{post.commentCount || 0}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Chat</span>
                                        </div>
                                    </div>
                                    {isOwnProfile && (
                                        <div className="flex gap-1.5 pl-2 sm:pl-4 border-l border-slate-100">
                                            <button onClick={e => { e.stopPropagation(); onOpen('create-post', post); }}
                                                className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all active:scale-90">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={e => {
                                                e.stopPropagation();
                                                if (window.confirm('Hành động này không thể hoàn tác. Xóa bài viết này?')) deleteMutation.mutate(post.id);
                                            }} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <FileText className="w-8 h-8 text-slate-200" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1">Chưa có bài viết nào</h3>
                            <p className="text-sm text-slate-400 max-w-xs mx-auto mb-6">Mọi thứ bắt đầu bằng một ý tưởng. Hãy chia sẻ bài viết đầu tiên của bạn!</p>
                            {isOwnProfile && (
                                <button
                                    onClick={() => import('@/components/hooks/useModalStore').then(({ default: useModal }) => useModal.getState().onOpen('create-post'))}
                                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/25"
                                >
                                    + Khởi tạo bài thảo luận
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, icon, highlight }) => (
    <div className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl transition-all group ${highlight ? 'bg-amber-50/80 border border-amber-100/50' : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'}`}>
        <div className={`p-2 rounded-xl bg-white shadow-sm transition-transform group-hover:scale-110 ${highlight ? 'text-amber-500' : 'text-slate-400'}`}>{icon}</div>
        <div className={`text-2xl font-black tracking-tight ${highlight ? 'text-amber-600' : 'text-slate-800'}`}>{value}</div>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center leading-none">{label}</div>
    </div>
);

export default Profile;
