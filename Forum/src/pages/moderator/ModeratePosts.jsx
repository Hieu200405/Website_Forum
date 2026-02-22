import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingPosts, moderatePost } from '@/features/admin/api/adminService';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ModeratePosts = () => {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-pending-posts'],
        queryFn: () => getPendingPosts()
    });

    const mutatePost = useMutation({
        mutationFn: ({ postId, action, reason }) => moderatePost(postId, action, reason),
        onSuccess: () => {
            toast.success('Đã xét duyệt bài viết');
            queryClient.invalidateQueries({ queryKey: ['admin-pending-posts'] });
        },
        onError: (err) => {
            toast.error(err.message || 'Lỗi khi duyệt bài');
        }
    });

    const handleAction = (postId, action) => {
        let reason = '';
        if (action === 'hide') {
            reason = window.prompt('Nhập lý do ẩn/từ chối bài viết:');
            if (reason === null) return; // Cancelled
        }
        mutatePost.mutate({ postId, action, reason });
    };

    const pendingPosts = data?.posts || [];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Duyệt bài viết (Trong hàng đợi)</h1>
            
            {pendingPosts.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                    <p className="text-lg font-medium text-slate-700">Tuyệt vời!</p>
                    <p>Hiện tại không có bài viết nào cần duyệt.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingPosts.map(post => (
                        <div key={post.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded">Chờ duyệt</span>
                                    <span className="text-slate-500 text-sm">bởi {post.author?.username || 'Unknown'}</span>
                                    <span className="text-slate-500 text-xs">• Danh mục: {post.category?.name || 'General'}</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">{post.title}</h3>
                                <p className="text-slate-600 mb-4 line-clamp-3 bg-slate-50 p-3 rounded border border-slate-100">{post.content}</p>
                            </div>
                            
                            <div className="flex shrink-0 flex-row md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                <button 
                                    onClick={() => handleAction(post.id, 'approve')}
                                    disabled={mutatePost.isPending}
                                    className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 w-full px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Chấp nhận</span>
                                </button>
                                <button 
                                    onClick={() => handleAction(post.id, 'hide')}
                                    disabled={mutatePost.isPending}
                                    className="flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 w-full px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                                >
                                    <XCircle className="w-5 h-5" />
                                    <span>Từ chối</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ModeratePosts;
