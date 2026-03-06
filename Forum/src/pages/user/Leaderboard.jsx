import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Trophy, Medal, Star, Flame, Loader2, Sparkles, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getLeaderboard = async () => {
    const { data } = await api.get('/users/leaderboard');
    return data;
};

const Leaderboard = () => {
    const navigate = useNavigate();
    const { data: response, isLoading, isError } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: getLeaderboard
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (isError || !response?.success) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p>Không thể tải bảng xếp hạng lúc này.</p>
            </div>
        );
    }

    const topUsers = response.data || [];

    const getBadgeStyle = (rep) => {
        if (rep >= 1000) return { bg: 'bg-gradient-to-r from-purple-500 to-pink-500', text: 'Huyền thoại', icon: <Sparkles className="w-3 h-3 text-white" /> };
        if (rep >= 500) return { bg: 'bg-blue-500', text: 'Chuyên gia', icon: <Flame className="w-3 h-3 text-white" /> };
        if (rep >= 100) return { bg: 'bg-green-500', text: 'Đóng góp tích cực', icon: <Star className="w-3 h-3 text-white" /> };
        if (rep >= 10) return { bg: 'bg-orange-500', text: 'Thành viên mới', icon: <Star className="w-3 h-3 text-white" /> };
        return { bg: 'bg-slate-500', text: 'Tân binh', icon: <Star className="w-3 h-3 text-white" /> };
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="p-5 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Trophy className="w-16 h-16 text-yellow-300 drop-shadow-lg" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-extrabold mb-2 text-white">Bảng Phong Thần</h1>
                        <p className="text-primary-100 text-lg max-w-xl">
                            Tôn vinh những cá nhân xuất sắc có đóng góp lớn nhất cho cộng đồng dựa trên điểm ⚡ Uy tín (Nhận điểm khi bài viết được Like).
                        </p>
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-50px] left-[20%] w-48 h-48 bg-primary-400/20 rounded-full blur-2xl"></div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {topUsers.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">Chưa có ai trong danh sách.</div>
                ) : (
                    <ul className="divide-y divide-slate-50">
                        {topUsers.map((user, index) => {
                            const badge = getBadgeStyle(user.reputation || 0);
                            
                            // Rank coloring
                            let rankBg = "bg-slate-100 text-slate-500";
                            if (index === 0) rankBg = "bg-yellow-100 text-yellow-600 ring-2 ring-yellow-400";
                            else if (index === 1) rankBg = "bg-slate-200 text-slate-600 ring-2 ring-slate-400";
                            else if (index === 2) rankBg = "bg-orange-100 text-orange-700 ring-2 ring-orange-500";

                            return (
                                <li 
                                    key={user.id} 
                                    className="p-5 hover:bg-slate-50 transition-colors flex items-center gap-5 cursor-pointer group"
                                    onClick={() => navigate(`/user/profile/${user.id}`)}
                                >
                                    {/* Rank number */}
                                    <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-bold text-xl ${rankBg} shadow-sm relative`}>
                                        {index < 3 ? <Medal className="w-6 h-6 absolute opacity-20" /> : null}
                                        <span className="relative z-10">#{index + 1}</span>
                                    </div>
                                    
                                    {/* Avatar */}
                                    <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-100">
                                        <img 
                                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                                            alt={user.username} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-800 mb-1 truncate flex items-center gap-2">
                                            {user.username}
                                            {index === 0 && <Sparkles className="w-4 h-4 text-yellow-500" />}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-white text-xs font-semibold shadow-sm ${badge.bg}`}>
                                                {badge.icon}
                                                {badge.text}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="shrink-0 text-right pr-4">
                                        <div className="text-2xl font-black text-amber-500 drop-shadow-sm flex items-center justify-end gap-1.5">
                                            <Flame className="w-6 h-6 text-amber-400" />
                                            {user.reputation || 0}
                                        </div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Uy tín</div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
