import React from 'react';
import { Users, FileText, Flag, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon, color, trend }) => {
    const Icon = icon;
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                {trend && (
                    <div className="flex items-center space-x-1 mt-2 text-xs font-semibold text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        <span>{trend}</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    // TODO: Fetch Real Stats from API
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>
                    <p className="text-slate-500 mt-1">Chào mừng quay trở lại, Admin!</p>
                </div>
                <div className="text-sm text-slate-400">
                    Cập nhật lần cuối: Vừa xong
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Tổng thành viên" 
                    value="1,245" 
                    icon={Users} 
                    color="bg-blue-500" 
                    trend="+12% tuần này"
                />
                <StatCard 
                    title="Bài viết" 
                    value="8,540" 
                    icon={FileText} 
                    color="bg-primary-500" 
                    trend="+56 hôm nay"
                />
                <StatCard 
                    title="Báo cáo vi phạm" 
                    value="12" 
                    icon={Flag} 
                    color="bg-red-500" 
                />
                <StatCard 
                    title="Đang hoạt động" 
                    value="342" 
                    icon={Users} 
                    color="bg-green-500" 
                />
            </div>

            {/* Recent Activity (Placeholder) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[400px]">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Hoạt động gần đây</h3>
                <div className="text-center text-slate-400 py-20">
                    Chưa có dữ liệu hoạt động.
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
