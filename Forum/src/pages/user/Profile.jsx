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
    const response = await api.get(`/users/${id}`);
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

    const { data: userResponse, isLoading: userLoading, error: userError } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => getUserProfile(userId),
        retry: false
    });

    const { data: postsResponse, isLoading: postsLoading } = useQuery({
        queryKey: ['posts', 'user', userId],
        queryFn: () => getPosts({ authorId: userId, limit: 50 }),
        enabled: !!userId
    });

    const { user: currentUser } = useAuthStore();
    const isOwnProfile = currentUser && String(currentUser.id) === String(userId);

    const { data: followStatus, refetch: refetchFollow } = useQuery({
        queryKey: ['followStatus', userId],
        queryFn: async () => { const res = await api.get(`/users/${userId}/check-follow`); return res.data.isFollowing; },
        enabled: !!currentUser && !isOwnProfile,
        retry: false
    });

    const { data: followersData, refetch: refetchFollowers } = useQuery({
        queryKey: ['followers', userId],
        queryFn: async () => { const res = await api.get(`/users/${userId}/followers`); return res.data.data; },
        enabled: !!userId, retry: false
    });

    const { data: followingData } = useQuery({
        queryKey: ['following', userId],
        queryFn: async () => { const res = await api.get(`/users/${userId}/following`); return res.data.data; },
        enabled: !!userId, retry: false
    });

    const deleteMutation = useDeletePost();
    const { onOpen } = useModalStore();

    const followMutation = useMutation({
        mutationFn: async () => { await api.post(`/users/${userId}/follow`); },
        onSuccess: () => { toast.success(`Đã theo dõi ${userResponse?.username || 'người dùng'}`); refetchFollow(); refetchFollowers(); },
        onError: err => toast.error(err.response?.data?.message || 'Có lỗi xảy ra')
    });

    const unfollowMutation = useMutation({
        mutationFn: async () => { await api.post(`/users/${userId}/unfollow`); },
        onSuccess: () => { toast.success(`Đã bỏ theo dõi ${userResponse?.username}`); refetchFollow(); refetchFollowers(); },
        onError: err => toast.error(err.response?.data?.message || 'Có lỗi xảy ra')
    });

    const user = userResponse || null;
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
        <div className="max-w-5xl mx-auto pb-20 fade-in">
            <Helmet>
                <title>{user.username} | Hồ sơ cá nhân - ForumHub</title>
                <meta name="description" content={`Xem hồ sơ của ${user.username} trên ForumHub - thành viên nổi bật với ${rep} điểm uy tín`} />
                <meta property="og:title" content={`${user.username} | ForumHub`} />
                <meta property="og:description" content={`Thành viên nổi bật - ${badge.label} với ${rep} điểm uy tín`} />
                <meta property="og:image" content={avatarSrc} />
            </Helmet>

            {/* ─── Hero Banner ─── */}
            <div className="relative h-44 rounded-3xl overflow-hidden mb-0"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)' }}>
                <div className="absolute inset-0 opacity-30"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute top-4 right-5 flex gap-2 opacity-60">
                    {[...Array(5)].map((_, i) => <Zap key={i} className="w-4 h-4 text-white/50" />)}
                </div>
            </div>

            {/* ─── Profile block ─── */}
            <div className="bg-white rounded-3xl -mt-12 mx-4 shadow-xl border border-slate-100 p-6">
                <div className="flex flex-col sm:flex-row gap-5">
                    {/* Avatar */}
                    <div className="relative shrink-0 self-start sm:self-auto">
                        <div className={`w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl border-4 border-transparent bg-gradient-to-br ${badge.gradient}`}>
                            <img src={avatarSrc} alt={user.username} className="w-full h-full object-cover" />
                        </div>
                        {/* Rank badge */}
                        <div className={`absolute -bottom-2 -right-2 bg-gradient-to-r ${badge.gradient} text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap`}>
                            {badge.emoji} {badge.label}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between flex-wrap gap-3">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">{user.username}</h1>
                                <p className="text-sm text-slate-500 font-medium capitalize">{user.role}</p>
                            </div>

                            {/* Action button */}
                            {isOwnProfile ? (
                                <button onClick={() => navigate('/user/settings')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-primary-50 text-slate-600 hover:text-primary-700 border border-slate-200 hover:border-primary-300 font-semibold text-sm rounded-xl transition-all">
                                    <Settings2 className="w-4 h-4" />
                                    Chỉnh sửa hồ sơ
                                </button>
                            ) : (
                                <button
                                    onClick={() => followStatus ? unfollowMutation.mutate() : followMutation.mutate()}
                                    disabled={followMutation.isPending || unfollowMutation.isPending}
                                    className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl transition-all shadow-md ${
                                        followStatus
                                            ? 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-200 shadow-none'
                                            : 'text-white shadow-primary-400/40 hover:-translate-y-0.5 hover:shadow-lg'
                                    }`}
                                    style={!followStatus ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}
                                >
                                    {followMutation.isPending || unfollowMutation.isPending
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Users className="w-4 h-4" />
                                    }
                                    {followStatus ? 'Bỏ theo dõi' : 'Theo dõi'}
                                </button>
                            )}
                        </div>

                        {/* Bio */}
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                            {user.bio || <span className="italic text-slate-400">Chưa có tiểu sử.</span>}
                        </p>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Tham gia {user.created_at ? format(new Date(user.created_at), 'MMMM yyyy', { locale: vi }) : 'Gần đây'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 mt-6 pt-5 border-t border-slate-100">
                    <StatBox label="Bài viết" value={posts.length} icon={<FileText className="w-4 h-4 text-primary-500" />} />
                    <StatBox label="Người theo dõi" value={followersData?.length || 0} icon={<Users className="w-4 h-4 text-violet-500" />} />
                    <StatBox label="Đang theo dõi" value={followingData?.length || 0} icon={<Heart className="w-4 h-4 text-rose-500" />} />
                    <StatBox label="Uy tín" value={rep} icon={<Zap className="w-4 h-4 text-amber-500" />} highlight />
                </div>
            </div>

            {/* ─── Posts ─── */}
            <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-500" />
                    <h2 className="font-bold text-slate-800">Bài viết của {user.username}</h2>
                    <span className="ml-auto text-xs text-slate-400 font-semibold">{posts.length} bài</span>
                </div>

                {postsLoading ? (
                    <div className="py-12 flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                ) : posts.length > 0 ? (
                    <ul className="divide-y divide-slate-50">
                        {posts.map(post => (
                            <li
                                key={post.id}
                                onClick={() => navigate(`/user/posts/${post.id}`)}
                                className="group px-6 py-4 hover:bg-slate-50/70 cursor-pointer transition-colors flex items-center gap-4"
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 text-[15px] group-hover:text-primary-700 transition-colors truncate">{post.title}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                                        <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                            {post.category || 'Thảo luận'}
                                        </span>
                                        <span>{format(new Date(post.createdAt), 'dd/MM/yyyy')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                                        <Heart className="w-3.5 h-3.5" /> {post.likeCount || 0}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                        <MessageSquare className="w-3.5 h-3.5" /> {post.commentCount || 0}
                                    </span>
                                    {isOwnProfile && (
                                        <div className="flex gap-1">
                                            <button onClick={e => { e.stopPropagation(); onOpen('create-post', post); }}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={e => {
                                                e.stopPropagation();
                                                if (window.confirm('Xóa bài viết này?')) deleteMutation.mutate(post.id);
                                            }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="py-16 text-center">
                        <FileText className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-400 font-medium">Người dùng này chưa có bài viết nào.</p>
                        {isOwnProfile && (
                            <button
                                onClick={() => import('@/components/hooks/useModalStore').then(({ default: useModal }) => useModal.getState().onOpen('create-post'))}
                                className="mt-4 btn-primary text-sm"
                            >
                                + Đăng bài đầu tiên
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatBox = ({ label, value, icon, highlight }) => (
    <div className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${highlight ? 'bg-amber-50 border border-amber-100' : 'hover:bg-slate-50'}`}>
        <div className="p-1.5 rounded-lg bg-white shadow-sm">{icon}</div>
        <div className={`text-xl font-black ${highlight ? 'text-amber-600' : 'text-slate-800'}`}>{value}</div>
        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide text-center">{label}</div>
    </div>
);

export default Profile;
