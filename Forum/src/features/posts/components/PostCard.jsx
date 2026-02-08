import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Heart, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import PostMenu from './PostMenu';
import { useDeletePost } from '../hooks/useDeletePost';
import useModalStore from '@/components/hooks/useModalStore';

const PostCard = ({ post, onLike }) => {
  const navigate = useNavigate();
  const deleteMutation = useDeletePost();
  const { onOpen } = useModalStore();

  const handlePostClick = () => {
    navigate(`/user/posts/${post.id}`);
  };

  return (
    <div className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300">
      {/* Header Info */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={handlePostClick}>
            <div className="relative">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-500 to-primary-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {post.author?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                {/* Online Indicator (Fake) */}
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
            <h4 className="font-bold text-slate-900 leading-tight hover:text-primary-600 cursor-pointer transition-colors">
                {post.author?.username || 'Người dùng ẩn danh'}
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center">
                {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi }) : 'Vừa xong'}
                <span className="mx-1">•</span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">
                    {post.category || 'Thảo luận'}
                </span>
            </p>
            </div>
        </div>
        <PostMenu 
            post={post}
            onEdit={() => onOpen('create-post', post)}
            onDelete={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
                    deleteMutation.mutate(post.id);
                }
            }}
        />
      </div>

      {/* Content */}
      <div className="pl-14 cursor-pointer" onClick={handlePostClick}> 
          <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug hover:text-primary-600 transition-colors">
            {post.title}
          </h3>
          <p className="text-slate-600 leading-relaxed text-[15px] mb-4 line-clamp-3">
            {post.content}
          </p>

          {/* Action Bar */}
          <div className="flex items-center space-x-6 pt-4 border-t border-slate-50">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onLike(post.id);
                }}
                className="flex items-center group/btn space-x-2 text-slate-500 hover:text-red-500 transition-colors"
            >
                <div className="p-2 rounded-full group-hover/btn:bg-red-50 transition-colors">
                    <Heart className={`w-5 h-5 transition-transform group-active/btn:scale-75 ${post.isLiked ? 'fill-current text-red-500' : ''}`} />
                </div>
                <span className="text-sm font-semibold">{post.likeCount || 0}</span>
            </button>

            <button className="flex items-center group/btn space-x-2 text-slate-500 hover:text-primary-600 transition-colors">
                <div className="p-2 rounded-full group-hover/btn:bg-primary-50 transition-colors">
                     <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold">{post.commentCount || 0} Bình luận</span>
            </button>
            
            <button className="flex items-center group/btn space-x-2 text-slate-500 hover:text-blue-500 transition-colors ml-auto">
                <div className="p-2 rounded-full group-hover/btn:bg-blue-50 transition-colors">
                    <Share2 className="w-5 h-5" />
                </div>
            </button>
          </div>
      </div>
    </div>
  );
};

export default PostCard;
