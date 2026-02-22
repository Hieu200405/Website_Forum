
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats, getSystemLogs } from '@/features/admin/api/adminService';
import { Users, FileText, Activity, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminDashboard = () => {
    // 1. Fetch Stats
    const { data: statsData } = useQuery({ queryKey: ['admin-stats'], queryFn: getAdminStats });
    const { data: logsData } = useQuery({ queryKey: ['admin-logs'], queryFn: () => getSystemLogs({ limit: 2 }) });

    const stats = [
        { label: 'Tổng người dùng', value: statsData?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Tổng bài viết', value: statsData?.totalPosts || 0, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Hệ thống', value: 'On', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    const logs = logsData?.logs || [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                        </div>
                        <div className={`p-4 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`w-8 h-8 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <Activity className="w-5 h-5 text-slate-500" />
                            Hoạt động gần đây
                        </h3>
                        <Link to="/admin/logs" className="text-sm text-primary-600 font-medium hover:underline flex items-center">
                            Xem tất cả <ArrowUpRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {logs.length > 0 ? logs.map(log => (
                             <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${log.level === 'WARN' ? 'bg-orange-500' : log.level === 'ERROR' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800">
                                        <span className="font-bold">{log.action}</span>
                                        {log.user && <span className="text-slate-500 font-normal"> bởi {log.user.username}</span>}
                                    </p>
                                </div>
                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: vi })}
                                </span>
                             </div>
                        )) : (
                            <p className="text-slate-500 text-sm">Chưa có log nào.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
