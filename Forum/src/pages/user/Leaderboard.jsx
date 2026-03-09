import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Trophy, Loader2, Sparkles, Flame, Star, AlertCircle, Zap, Crown, Medal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getLeaderboard = async () => {
    // api in lib/axios already returns response.data
    return await api.get('/users/leaderboard');
};

const getBadge = (rep) => {
    if (rep >= 1000) return { gradient: 'from-purple-500 via-pink-500 to-amber-400', label: 'Huyền thoại', emoji: '🌟' };
    if (rep >= 500)  return { gradient: 'from-blue-500 to-cyan-400', label: 'Chuyên gia', emoji: '🔥' };
    if (rep >= 100)  return { gradient: 'from-green-500 to-emerald-400', label: 'Tích cực', emoji: '⭐' };
    if (rep >= 10)   return { gradient: 'from-orange-400 to-amber-400', label: 'Thành viên', emoji: '🌱' };
    return           { gradient: 'from-slate-400 to-slate-500', label: 'Tân binh', emoji: '✨' };
};

const Leaderboard = () => {
    const navigate = useNavigate();
    const { data: response, isLoading, isError } = useQuery({ queryKey: ['leaderboard'], queryFn: getLeaderboard });

    if (isLoading) return (
        <div className="flex justify-center items-center h-64 fade-in">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
    );
    if (isError || !response?.success) return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p>Không thể tải bảng xếp hạng.</p>
        </div>
    );

    const topUsersRaw = Array.isArray(response) ? response : response?.data || [];
    const topUsers = Array.isArray(topUsersRaw) ? topUsersRaw : [];
    const top3 = topUsers.slice(0, 3);
    const rest = topUsers.slice(3);

    return (
        <div className="max-w-3xl mx-auto pb-20 fade-in">
            {/* ─── Hero Header ─── */}
            <div className="relative rounded-3xl overflow-hidden mb-8 text-white"
                style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 40%, #8b5cf6 70%, #a855f7 100%)' }}>
                {/* Decorative */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-12 -right-12 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-8 left-1/4 w-48 h-48 bg-violet-400/20 rounded-full blur-2xl" />
                    <div className="absolute top-4 left-8 w-2 h-2 bg-yellow-300 rounded-full opacity-60" />
                    <div className="absolute top-12 right-24 w-1.5 h-1.5 bg-pink-300 rounded-full opacity-60" />
                    <div className="absolute bottom-6 right-12 w-3 h-3 bg-cyan-300 rounded-full opacity-40" />
                </div>

                <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="p-5 bg-white/15 rounded-3xl backdrop-blur-sm ring-1 ring-white/20">
                        <Trophy className="w-14 h-14 text-yellow-300 drop-shadow-lg" />
                    </div>
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                            <span className="text-xs font-bold uppercase tracking-widest text-primary-200">Hall of Fame</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight">Bảng Phong Thần</h1>
                        <p className="text-primary-100 max-w-md text-sm leading-relaxed">
                            Top 10 thành viên có đóng góp lớn nhất cộng đồng, được xếp hạng theo điểm ⚡ Uy tín.
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── Top 3 Podium ─── */}
            {top3.length > 0 && (
                <div className="flex items-end justify-center gap-4 mb-8 px-4">
                    {/* 2nd */}
                    {top3[1] && <PodiumCard user={top3[1]} rank={2} onClick={() => navigate(`/user/profile/${top3[1].id}`)} />}
                    {/* 1st */}
                    {top3[0] && <PodiumCard user={top3[0]} rank={1} onClick={() => navigate(`/user/profile/${top3[0].id}`)} />}
                    {/* 3rd */}
                    {top3[2] && <PodiumCard user={top3[2]} rank={3} onClick={() => navigate(`/user/profile/${top3[2].id}`)} />}
                </div>
            )}

            {/* ─── Rest list ─── */}
            {rest.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-3.5 border-b border-slate-100 flex items-center gap-2">
                        <Medal className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-500">Tiếp theo</span>
                    </div>
                    <ul className="divide-y divide-slate-50">
                        {rest.map((user, i) => {
                            const badge = getBadge(user.reputation || 0);
                            const rank = i + 4;
                            return (
                                <li
                                    key={user.id}
                                    onClick={() => navigate(`/user/profile/${user.id}`)}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                                >
                                    <span className="text-sm font-black text-slate-400 w-6 shrink-0">#{rank}</span>
                                    <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-md">
                                        <img
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&bold=true`}
                                            alt={user.username}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-800 text-sm truncate">{user.username}</div>
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide mt-0.5 text-white px-2 py-0.5 rounded-full bg-gradient-to-r ${badge.gradient}`}>
                                            {badge.emoji} {badge.label}
                                        </span>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <div className="text-lg font-black text-amber-500 flex items-center gap-1">
                                            <Flame className="w-4 h-4" />
                                            {user.reputation || 0}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Uy tín</div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {topUsers.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                    <Trophy className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                    <p>Chưa có thành viên nào trong bảng xếp hạng.</p>
                </div>
            )}
        </div>
    );
};

const RANK_STYLES = {
    1: { height: 'h-48', bg: 'bg-gradient-to-b from-amber-50 to-white', ring: 'ring-amber-400', icon: <Crown className="w-5 h-5 text-amber-500" />, rankBg: 'from-amber-400 to-yellow-300 text-amber-900' },
    2: { height: 'h-40', bg: 'bg-gradient-to-b from-slate-100 to-white', ring: 'ring-slate-400', icon: <Medal className="w-5 h-5 text-slate-500" />, rankBg: 'from-slate-400 to-slate-300 text-white' },
    3: { height: 'h-36', bg: 'bg-gradient-to-b from-orange-50 to-white', ring: 'ring-orange-400', icon: <Medal className="w-5 h-5 text-orange-500" />, rankBg: 'from-orange-400 to-amber-300 text-white' },
};

const PodiumCard = ({ user, rank, onClick }) => {
    const style = RANK_STYLES[rank];
    const badge = getBadge(user.reputation || 0);
    return (
        <div
            onClick={onClick}
            className={`flex flex-col items-center cursor-pointer group ${rank === 1 ? 'order-2 md:order-none' : ''}`}
        >
            {rank === 1 && <Crown className="w-7 h-7 text-amber-400 mb-1 animate-bounce" />}
            <div className="relative mb-2">
                <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&bold=true&size=128`}
                    alt={user.username}
                    className={`rounded-full object-cover ring-4 ${style.ring} group-hover:scale-105 transition-transform duration-300 shadow-xl ${rank === 1 ? 'w-20 h-20' : 'w-16 h-16'}`}
                />
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-black px-2 py-0.5 rounded-full bg-gradient-to-r ${style.rankBg} shadow-md whitespace-nowrap`}>
                    #{rank}
                </div>
            </div>

            <div className={`${style.height} ${style.bg} w-32 md:w-36 rounded-t-2xl border border-slate-100 shadow-md flex flex-col items-center justify-start pt-6 px-2 text-center`}>
                <div className="font-bold text-slate-800 text-sm truncate w-full px-2">{user.username}</div>
                <div className={`mt-1 text-[10px] font-black text-white bg-gradient-to-r ${badge.gradient} px-2 py-0.5 rounded-full`}>
                    {badge.emoji} {badge.label}
                </div>
                <div className="mt-2 flex items-center gap-1 text-amber-500 font-black text-lg">
                    <Zap className="w-4 h-4" />
                    {user.reputation || 0}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
