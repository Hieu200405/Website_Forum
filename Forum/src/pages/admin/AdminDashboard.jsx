
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers, getReports, getSystemLogs } from './api/adminService';
import { getPosts } from '@/features/posts/api/postService';
import { Users, FileText, Flag, Activity } from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon, color, isLoading }) => {
    const Icon = icon;
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900">
                    {isLoading ? '...' : value}
                </h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    // 1. Fetch Stats (Parallel)
    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['admin-stats-users'],
        queryFn: () => getUsers({ limit: 1 }), // Get total from metadata
    });

    const { data: postData, isLoading: postLoading } = useQuery({
        queryKey: ['admin-stats-posts'],
        queryFn: () => getPosts({ limit: 1 }),
    });

    const { data: reportData, isLoading: reportLoading } = useQuery({
        queryKey: ['admin-stats-reports'],
        queryFn: () => getReports({ limit: 1 }),
    });

    // 2. Fetch Logs
    const { data: logsData, isLoading: logsLoading } = useQuery({
        queryKey: ['admin-logs'],
        queryFn: () => getSystemLogs({ limit: 10 }),
    });

    const logs = logsData?.data || [];
    const stats = {
        users: userData?.pagination?.total || 0,
        posts: postData?.pagination?.total || 0, // Note: postData format might differ
        reports: reportData?.pagination?.total || 0
    };

    // Helper to format log message
    const getLogMessage = (log) => {
        // Handle various log formats
        if (log.action && log.user) {
            return (
                <span>
                    <span className="font-semibold text-slate-800">{log.user?.username || 'System'}</span>
                    <span className="text-slate-500 mx-1">{log.action}</span>
                    <span className="text-slate-800">{log.details || ''}</span>
                </span>
            );
        }
        // Fallback for access logs or unknown format
        return (
            <span>
                <span className="font-bold text-slate-700 mr-2">[{log.method || 'LOG'}]</span>
                <span className="text-slate-600">{log.path || log.message || JSON.stringify(log)}</span>
            </span>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>
                    <p className="text-slate-500 mt-1">Chào mừng quay trở lại, Admin!</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Tổng thành viên" 
                    value={stats.users} 
                    icon={Users} 
                    color="bg-blue-500" 
                    isLoading={userLoading}
                />
                <StatCard 
                    title="Bài viết" 
                    value={stats.posts} // Post API returns { data: [], pagination: {}, ... } or { data: [] } check postService
                    icon={FileText} 
                    color="bg-primary-500" 
                    isLoading={postLoading}
                />
                <StatCard 
                    title="Báo cáo vi phạm" 
                    value={stats.reports} 
                    icon={Flag} 
                    color="bg-red-500" 
                    isLoading={reportLoading}
                />
            </div>

            {/* System Logs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[400px]">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-slate-500" />
                    <span>Hoạt động hệ thống</span>
                </h3>
                
                {logsLoading ? (
                    <div className="text-center py-20 text-slate-400">Đang tải nhật ký...</div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        Chưa có nhật ký hoạt động nào.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log, index) => (
                            <div key={log.id || index} className="flex items-start space-x-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                <div className="mt-1 h-2 w-2 rounded-full bg-slate-300 flex-shrink-0"></div>
                                <div className="flex-1">
                                    <p className="text-sm">
                                        {getLogMessage(log)}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        IP: {log.ip} - {log.createdAt ? format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss') : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
