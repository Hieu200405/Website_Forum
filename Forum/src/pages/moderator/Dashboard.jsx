import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getModerationStats } from '@/features/moderation/api/moderationService';
import { Shield, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, color, link }) => {
  const Icon = icon;
  return (
    <Link to={link || '#'} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-2">{value}</h3>
        </div>
        <div className={`p-4 rounded-full ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </Link>
  );
};

const ModeratorDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['moderation-stats'],
    queryFn: getModerationStats
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan Kiểm duyệt</h1>
        <p className="text-slate-500">Chào mừng trở lại! Đây là tình hình hoạt động của diễn đàn hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Báo cáo chờ xử lý" 
          value={stats?.data?.pendingReports || stats?.pendingReports || 0} 
          icon={AlertTriangle} 
          color="bg-orange-500"
          link="/moderator/reports"
        />
        <StatCard 
          title="Đã xử lý hôm nay" 
          value={stats?.data?.reviewedReports || stats?.reviewedReports || 0} 
          icon={CheckCircle} 
          color="bg-green-500"
          link="/moderator/reports"
        />
        {/* Placeholder for future features like Pending Posts */}
        <StatCard 
          title="Bài viết cần duyệt" 
          value={stats?.data?.pendingPosts || stats?.pendingPosts || 0} 
          icon={FileText} 
          color="bg-blue-500"
          link="/moderator/moderate"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-indigo-600" />
            Hướng dẫn nhanh
        </h2>
        <div className="prose prose-slate">
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Kiểm tra mục <strong>Báo cáo chờ xử lý</strong> để xem các bài viết bị người dùng báo cáo.</li>
                <li>Sử dụng quyền <strong>Ẩn</strong> hoặc <strong>Xóa</strong> bài viết nếu vi phạm tiêu chuẩn cộng đồng.</li>
                <li>Các bài viết chứa từ khóa cấm sẽ tự động bị chuyển sang trạng thái chờ duyệt.</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
