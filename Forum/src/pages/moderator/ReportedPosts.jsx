
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReports, moderatePost } from '@/features/moderation/api/moderationService';
import { AlertTriangle, Eye, Ban, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const ReportedPosts = () => {
    const queryClient = useQueryClient();
    const { data: reports = [], isLoading } = useQuery({
        queryKey: ['reports'],
        queryFn: getReports
    });

    const mutation = useMutation({
        mutationFn: ({ postId, action, reason }) => moderatePost(postId, action, reason),
        onSuccess: () => {
            toast.success('Đã xử lý thành công');
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
        onError: (err) => toast.error('Lỗi: ' + err.message)
    });

    const handleAction = (postId, action) => {
        if(window.confirm(`Bạn có chắc muốn ${action} bài viết này?`)) {
            mutation.mutate({ postId, action, reason: 'Vi phạm tiêu chuẩn (Mod action)' });
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Quản lý báo cáo vi phạm</h1>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Đang tải...</div>
                ) : reports.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p>Không có báo cáo nào chưa xử lý.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {reports.map((report) => (
                            <div key={report.id} className="p-6 hover:bg-slate-50 transition">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider">
                                                {report.reason}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: vi })}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                                            Bài viết: {report.post?.title || `Post #${report.post_id}`}
                                        </h3>
                                        <p className="text-sm text-slate-600 mb-3">
                                            Báo cáo bởi: <span className="font-medium text-slate-900">{report.reporter?.username}</span>
                                        </p>
                                        
                                        {/* Post Content Preview if available */}
                                        {report.post?.content && (
                                            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-500 italic mb-4 border border-slate-100">
                                                "{report.post.content.substring(0, 100)}..."
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2 ml-4">
                                        <button 
                                            onClick={() => handleAction(report.post_id, 'hide')}
                                            className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition font-medium text-sm"
                                        >
                                            <Ban className="w-4 h-4" />
                                            <span>Ẩn</span>
                                        </button>
                                        <button 
                                            onClick={() => handleAction(report.post_id, 'delete')}
                                            className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-medium text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Xóa</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportedPosts;
