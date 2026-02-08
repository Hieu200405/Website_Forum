import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCommentsByPost, createComment, replyComment } from '../api/commentService';
import CommentItem from './CommentItem';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import useAuthStore from '@/features/auth/store/authStore';
import useModalStore from '@/components/hooks/useModalStore';

const CommentSection = ({ postId }) => {
    const [content, setContent] = useState('');
    const [replyTo, setReplyTo] = useState(null); // the comment being replied to
    
    const token = useAuthStore((state) => state.token);
    const isAuthenticated = !!token;
    const { onOpen } = useModalStore();
    const queryClient = useQueryClient();

    // Fetch Comments
    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['comments', postId],
        queryFn: () => getCommentsByPost(postId),
        staleTime: 1000 * 60, // 1 minute
    });

    // Create Comment Mutation
    const createMutation = useMutation({
        mutationFn: createComment,
        onSuccess: () => {
            setContent('');
            toast.success('Đã bình luận!');
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
            queryClient.invalidateQueries({ queryKey: ['post', postId] }); // Update comment count
        },
        onError: () => toast.error('Lỗi khi bình luận')
    });

    // Reply Mutation
    const replyMutation = useMutation({
        mutationFn: replyComment,
        onSuccess: () => {
            setContent('');
            setReplyTo(null);
            toast.success('Đã trả lời!');
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
        },
        onError: () => toast.error('Lỗi khi trả lời')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isAuthenticated) return onOpen('login-required');
        if (!content.trim()) return;

        if (replyTo) {
            replyMutation.mutate({ parentId: replyTo.id, content });
        } else {
            createMutation.mutate({ postId, content });
        }
    };

    const isPending = createMutation.isPending || replyMutation.isPending;

    // Organize comments (Simple threading for 1-level)
    // We assume backend returns flat list. Filter root comments.
    const rootComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                Bình luận <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-sm">{comments.length}</span>
            </h3>

            {/* Input Box */}
            <form onSubmit={handleSubmit} className="mb-8 relative">
                {replyTo && (
                    <div className="flex items-center justify-between bg-blue-50 text-blue-700 px-3 py-2 rounded-t-lg text-sm border-b border-blue-100">
                        <span>Đang trả lời <b>{replyTo.user?.username}</b></span>
                        <button type="button" onClick={() => setReplyTo(null)} className="hover:underline">Hủy</button>
                    </div>
                )}
                <div className="flex space-x-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
                        {/* Current User Avatar Placeholder */}
                           <img src={`https://ui-avatars.com/api/?background=random`} alt="My Avatar" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 relative">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={replyTo ? "Viết câu trả lời..." : "Viết bình luận của bạn..."}
                            className={`w-full bg-slate-50 border-slate-200 rounded-2xl p-3 pr-12 text-sm focus:ring-primary-500 focus:border-primary-500 resize-none transition-all ${replyTo ? 'rounded-tl-none' : ''}`}
                            rows={replyTo ? 2 : 3}
                        />
                        <button 
                            type="submit"
                            disabled={!content.trim() || isPending}
                            className="absolute bottom-3 right-3 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-500/30"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </form>

            {/* Comment List */}
            {isLoading ? (
                <div className="text-center py-10 text-slate-400">Đang tải bình luận...</div>
            ) : rootComments.length === 0 ? (
                <div className="text-center py-10">
                    <div className="text-slate-400 mb-2">Chưa có bình luận nào</div>
                    <p className="text-sm text-slate-500">Hãy là người đầu tiên chia sẻ suy nghĩ!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {rootComments.map(comment => (
                        <div key={comment.id}>
                            <CommentItem comment={comment} onReply={setReplyTo} />
                            {/* Render Replies */}
                            <div className="ml-0">
                                {getReplies(comment.id).map(reply => (
                                    <CommentItem key={reply.id} comment={reply} onReply={setReplyTo} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentSection;
