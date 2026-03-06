
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats, getSystemLogs } from '@/features/admin/api/adminService';
import {
    Users, FileText, Activity, MessageSquare, Heart,
    ShieldAlert, EyeOff, TrendingUp, ArrowUpRight, Flame,
    CheckCircle, Clock, Loader2, Trophy, Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format, subDays, eachDayOfInterval } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── Chart Palette ─────────────────────────────────────────────
const PALETTE = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#06b6d4'];

const DOW_LABELS = ['', 'CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// ─── Fill date gaps with zeros ──────────────────────────────────
const fillDateGaps = (data, days = 30) => {
    const map = {};
    (data || []).forEach(d => { map[d.date?.slice(0, 10)] = Number(d.count); });
    return eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() }).map(d => ({
        date: format(d, 'dd/MM'),
        count: map[format(d, 'yyyy-MM-dd')] || 0,
    }));
};

// ─── Custom Tooltip ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-sm">
            <p className="font-bold text-slate-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
            ))}
        </div>
    );
};

// ─── Stat Card ───────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, gradient, trend }) => {
    const IconComponent = icon;
    return (
        <div className={`relative overflow-hidden rounded-2xl p-5 text-white`} style={{ background: gradient }}>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-3xl font-black">{value?.toLocaleString()}</p>
                    {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
                </div>
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                    <IconComponent className="w-5 h-5 text-white" />
                </div>
            </div>
            {trend !== undefined && (
                <div className="relative z-10 mt-3 flex items-center gap-1 text-xs font-semibold text-white/80">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{trend}</span>
                </div>
            )}
        </div>
    );
};

// ─── Section wrapper ─────────────────────────────────────────────
const Section = ({ title, icon, children, action }) => {
    const IconComponent = icon;
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.04)' }}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary-50">
                        <IconComponent className="w-4 h-4 text-primary-600" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
                </div>
                {action}
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
};

// ─── Main Dashboard ──────────────────────────────────────────────
const AdminDashboard = () => {
    const navigate = useNavigate();
    const { data: statsResponse, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: getAdminStats, refetchInterval: 30000 });
    const { data: logsData } = useQuery({ queryKey: ['admin-logs-recent'], queryFn: () => getSystemLogs({ limit: 6 }) });

    const stats  = statsResponse?.data?.overview || statsResponse?.overview || {};
    const charts = statsResponse?.data?.charts   || statsResponse?.charts   || {};
    const topPosters = statsResponse?.data?.topPosters || statsResponse?.topPosters || [];
    const logs   = logsData?.logs || [];

    const userChartData    = fillDateGaps(charts.usersByDay, 30);
    const postChartData    = fillDateGaps(charts.postsByDay, 30);
    const commentChartData = fillDateGaps(charts.commentsByDay, 14);

    const categoryData = (charts.postsByCategory || []).map(d => ({
        name: d.category,
        value: Number(d.count)
    }));

    const weekdayData = (charts.postsByWeekday || []).map(d => ({
        day: DOW_LABELS[d.dow] || `T${d.dow}`,
        posts: Number(d.count)
    }));

    // Merge user + post lines into one area chart
    const activityData = userChartData.map((u, i) => ({
        date: u.date,
        'Người dùng': u.count,
        'Bài viết': postChartData[i]?.count || 0,
    }));

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
    );

    return (
        <div className="space-y-6 fade-in">
            {/* ─── Page Header ─── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Tổng quan hệ thống</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Cập nhật tự động mỗi 30 giây · {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Hệ thống hoạt động bình thường
                </div>
            </div>

            {/* ─── Stat Cards ─── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={Users}       label="Người dùng"  value={stats.totalUsers}    sub={`${stats.bannedUsers || 0} bị cấm`} gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" trend="Tổng tài khoản đã đăng ký" />
                <StatCard icon={FileText}    label="Bài viết"    value={stats.totalPosts}     sub={`${stats.pendingPosts || 0} chờ duyệt`} gradient="linear-gradient(135deg, #ec4899, #f43f5e)" trend={`${stats.activePostsRate || 0}% đã được duyệt`} />
                <StatCard icon={MessageSquare} label="Bình luận" value={stats.totalComments}  gradient="linear-gradient(135deg, #f59e0b, #f97316)" trend="Comments đang hoạt động" />
                <StatCard icon={Heart}       label="Lượt thích"  value={stats.totalLikes}     gradient="linear-gradient(135deg, #10b981, #06b6d4)" trend="Tổng tương tác" />
            </div>

            {/* ─── Secondary stat row ─── */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 rounded-xl"><Clock className="w-4 h-4 text-amber-600" /></div>
                    <div>
                        <div className="text-xl font-black text-amber-700">{stats.pendingPosts || 0}</div>
                        <div className="text-xs font-bold text-amber-600">Chờ kiểm duyệt</div>
                    </div>
                    <Link to="/moderator" className="ml-auto text-amber-500 hover:text-amber-700 transition"><ArrowUpRight className="w-5 h-5" /></Link>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-red-100 rounded-xl"><ShieldAlert className="w-4 h-4 text-red-600" /></div>
                    <div>
                        <div className="text-xl font-black text-red-700">{stats.bannedUsers || 0}</div>
                        <div className="text-xs font-bold text-red-600">Tài khoản bị cấm</div>
                    </div>
                    <Link to="/admin/users" className="ml-auto text-red-400 hover:text-red-600 transition"><ArrowUpRight className="w-5 h-5" /></Link>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-slate-200 rounded-xl"><EyeOff className="w-4 h-4 text-slate-600" /></div>
                    <div>
                        <div className="text-xl font-black text-slate-700">{stats.hiddenPosts || 0}</div>
                        <div className="text-xs font-bold text-slate-600">Bài đã ẩn</div>
                    </div>
                </div>
            </div>

            {/* ─── Charts Row 1: Activity Line ─── */}
            <Section
                title="Hoạt động 30 ngày qua"
                icon={Activity}
                action={
                    <span className="text-xs text-slate-400 font-medium">Người dùng & Bài viết mới</span>
                }
            >
                <ResponsiveContainer width="100%" height={230}>
                    <AreaChart data={activityData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                        <defs>
                            <linearGradient id="gradUser" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.18} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradPost" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#ec4899" stopOpacity={0.18} />
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                        <Area type="monotone" dataKey="Người dùng" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradUser)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
                        <Area type="monotone" dataKey="Bài viết"   stroke="#ec4899" strokeWidth={2.5} fill="url(#gradPost)"  dot={false} activeDot={{ r: 5, fill: '#ec4899' }} />
                    </AreaChart>
                </ResponsiveContainer>
            </Section>

            {/* ─── Charts Row 2: Bar + Pie ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar: Posts by Weekday */}
                <Section title="Bài đăng theo ngày trong tuần" icon={TrendingUp}>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weekdayData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                            <Bar dataKey="posts" name="Bài viết" fill="#6366f1" radius={[6, 6, 0, 0]}>
                                {weekdayData.map((_, i) => (
                                    <Cell key={i} fill={i === new Date().getDay() ? '#ec4899' : '#6366f1'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-center text-slate-400 mt-1">Ngày hôm nay được tô <span className="text-pink-500 font-bold">màu hồng</span></p>
                </Section>

                {/* Pie: Posts by Category */}
                <Section title="Phân bổ theo chuyên mục" icon={FileText}>
                    {categoryData.length > 0 ? (
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="55%" height={200}>
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                                        dataKey="value" paddingAngle={3} strokeWidth={0}>
                                        {categoryData.map((_, i) => (
                                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => [v, 'Bài viết']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-1.5">
                                {categoryData.slice(0, 6).map((cat, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                                        <span className="text-slate-600 font-medium truncate flex-1">{cat.name}</span>
                                        <span className="font-bold text-slate-700">{cat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu</div>
                    )}
                </Section>
            </div>

            {/* ─── Comments trend ─── */}
            <Section title="Bình luận 14 ngày qua" icon={MessageSquare}>
                <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={commentChartData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                        <defs>
                            <linearGradient id="gradComment" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={1} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="count" name="Bình luận" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gradComment)" dot={false} activeDot={{ r: 4, fill: '#f59e0b' }} />
                    </AreaChart>
                </ResponsiveContainer>
            </Section>

            {/* ─── Bottom Row: Top Posters + Recent Logs ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Posters */}
                <Section title="Top người dùng tích cực" icon={Trophy}>
                    <ul className="space-y-3">
                        {topPosters.length > 0 ? topPosters.map((u, i) => (
                            <li key={u.id} className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-xl transition"
                                onClick={() => navigate(`/user/profile/${u.id}`)}>
                                <span className={`text-xs font-black w-6 h-6 rounded-lg flex items-center justify-center ${
                                    i === 0 ? 'bg-amber-100 text-amber-700' :
                                    i === 1 ? 'bg-slate-200 text-slate-600' :
                                    i === 2 ? 'bg-orange-100 text-orange-700' :
                                    'bg-primary-50 text-primary-600'
                                }`}>
                                    {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}
                                </span>
                                <img
                                    src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=6366f1&color=fff&bold=true`}
                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                                    alt={u.username}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-slate-800 text-sm truncate group-hover:text-primary-700 transition">{u.username}</div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span className="flex items-center gap-0.5"><FileText className="w-3 h-3" /> {u.postCount} bài</span>
                                        <span className="flex items-center gap-0.5 text-amber-500"><Zap className="w-3 h-3" /> {u.reputation}</span>
                                    </div>
                                </div>
                                <Flame className="w-4 h-4 text-orange-400 opacity-0 group-hover:opacity-100 transition" />
                            </li>
                        )) : (
                            <p className="text-slate-400 text-sm text-center py-4">Chưa có dữ liệu</p>
                        )}
                    </ul>
                </Section>

                {/* Recent System Logs */}
                <Section
                    title="Nhật ký hệ thống"
                    icon={Activity}
                    action={
                        <Link to="/admin/logs" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    }
                >
                    <div className="space-y-2">
                        {logs.length > 0 ? logs.map(log => (
                            <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition">
                                <div className={`mt-1 shrink-0 w-2.5 h-2.5 rounded-full ${
                                    log.level === 'WARN'  ? 'bg-amber-500' :
                                    log.level === 'ERROR' ? 'bg-red-500'   : 'bg-primary-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800">{log.action}</p>
                                    {log.user && <p className="text-xs text-slate-400">bởi {log.user.username}</p>}
                                </div>
                                <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: vi })}
                                </span>
                            </div>
                        )) : (
                            <div className="py-8 text-center">
                                <CheckCircle className="w-8 h-8 mx-auto text-emerald-300 mb-2" />
                                <p className="text-sm text-slate-400">Chưa có hoạt động nào gần đây</p>
                            </div>
                        )}
                    </div>
                </Section>
            </div>
        </div>
    );
};

export default AdminDashboard;
