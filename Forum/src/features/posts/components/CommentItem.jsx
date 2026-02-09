import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Reply, ThumbsUp } from 'lucide-react';

const CommentItem = ({ comment, onReply }) => {
    const isReply = !!comment.parent_id;

    return (
        <div className={`flex space-x-3 ${isReply ? 'ml-12 mt-3' : 'mt-4'}`}>
            <div className="flex-shrink-0">
                <div className={`rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 ${isReply ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'}`}>
                    {comment.author?.username?.[0]?.toUpperCase() || 'U'}
                </div>
            </div>
            <div className="flex-1">
                <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-sm">{comment.author?.username || 'Người dùng ẩn danh'}</span>
                        <span className="text-xs text-slate-400">
                             {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi }) : 'Vừa xong'}
                        </span>
                    </div>
                    <p className="text-slate-700 text-[15px] leading-relaxed">{comment.content}</p>
                </div>
                
                <div className="flex items-center space-x-4 mt-1 ml-2">
                    {/* Note: Like comment functionality requires backend API implementation */}
                    <button 
                        className="text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors flex items-center space-x-1"
                        disabled
                        title="Chức năng đang phát triển"
                    >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Thích</span>
                    </button>
                    <button 
                        onClick={() => onReply(comment)}
                        className="text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors flex items-center space-x-1"
                    >
                        <Reply className="w-3 h-3" />
                        <span>Trả lời</span>
                    </button>
                </div>

                {/* Recursive render for replies if backend supports nested structure directly or we map it */}
                {/* For now simplified: assumes flat list or one-level handled by parent for simplicity */}
            </div>
        </div>
    );
};

export default CommentItem;
