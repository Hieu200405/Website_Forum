import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Heart, Reply, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeComment, unlikeComment, deleteComment } from '../api/commentService';
import useAuthStore from '@/features/auth/store/authStore';
import toast from 'react-hot-toast';

const CommentItem = ({ comment, postId, onReply, depth = 0 }) => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [showReplies, setShowReplies] = useState(true);

    // Optimistic like state
    const [liked, setLiked]         = useState(comment.isLiked ?? false);
    const [likeCount, setLikeCount] = useState(comment.likeCount ?? comment.like_count ?? 0);

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['comments', postId] });

    const likeMutation = useMutation({
        mutationFn: () => liked ? unlikeComment(comment.id) : likeComment(comment.id),
        onMutate: () => {
            // Optimistic update
            setLiked(prev => !prev);
            setLikeCount(prev => liked ? Math.max(0, prev - 1) : prev + 1);
        },
        onError: () => {
            // Rollback
            setLiked(prev => !prev);
            setLikeCount(prev => liked ? prev + 1 : Math.max(0, prev - 1));
            toast.error('Có lỗi xảy ra');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteComment(comment.id),
        onSuccess: () => { toast.success('Đã xóa bình luận'); invalidate(); },
        onError:   () => toast.error('Không thể xóa bình luận'),
    });

    const canDelete = user && (user.id === comment.author?.id || ['admin', 'moderator'].includes(user.role));
    const isReply   = depth > 0;
    const replies   = comment.replies || [];

    return (
        <div className={`${isReply ? 'ml-10 mt-2' : 'mt-4'}`}>
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                    <img
                        src={comment.author?.avatar ||
                            `https://ui-avatars.com/api/?name=${comment.author?.username || 'U'}&background=6366f1&color=fff&bold=true`}
                        className={`rounded-full object-cover ring-2 ring-white shadow-sm ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}
                        alt=""
                    />
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                    {/* Bubble */}
                    <div
                        className="rounded-2xl rounded-tl-none px-4 py-3"
                        style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-color)' }}
                    >
                        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {comment.author?.username || 'Ẩn danh'}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {comment.created_at || comment.createdAt
                                    ? formatDistanceToNow(new Date(comment.created_at || comment.createdAt), { addSuffix: true, locale: vi })
                                    : 'Vừa xong'}
                            </span>
                        </div>
                        <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {comment.content}
                        </p>
                    </div>

                    {/* Action row */}
                    <div className="flex items-center gap-3 mt-1.5 ml-1">
                        {/* Like */}
                        <button
                            onClick={() => user ? likeMutation.mutate() : toast.error('Vui lòng đăng nhập')}
                            className={`flex items-center gap-1 text-xs font-bold transition-all ${
                                liked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                            }`}
                        >
                            <Heart size={13} className={liked ? 'fill-current' : ''} />
                            <span>{likeCount > 0 ? likeCount : 'Thích'}</span>
                        </button>

                        {/* Reply */}
                        {depth < 2 && (
                            <button
                                onClick={() => onReply?.(comment)}
                                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors"
                            >
                                <Reply size={13} />
                                <span>Trả lời</span>
                            </button>
                        )}

                        {/* Delete */}
                        {canDelete && (
                            <button
                                onClick={() => window.confirm('Xóa bình luận này?') && deleteMutation.mutate()}
                                className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-red-500 transition-colors ml-auto"
                                title="Xóa bình luận"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Replies */}
            {replies.length > 0 && (
                <div className="mt-2">
                    <button
                        onClick={() => setShowReplies(v => !v)}
                        className="ml-13 text-xs font-bold text-primary-500 hover:text-primary-700 flex items-center gap-1 ml-12 mb-1"
                    >
                        {showReplies
                            ? <><ChevronUp size={12} /> Ẩn {replies.length} phản hồi</>
                            : <><ChevronDown size={12} /> Xem {replies.length} phản hồi</>}
                    </button>
                    {showReplies && replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            postId={postId}
                            onReply={onReply}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
