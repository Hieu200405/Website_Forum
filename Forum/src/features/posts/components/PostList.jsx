import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '@/features/posts/api/postService';
import PostCard from './PostCard';
import PostCardSkeleton from './PostSkeleton';
import { useLikePost } from '../hooks/useLikePost';
import { TrendingUp, Clock, Filter } from 'lucide-react';

// Custom Tab Selector
const TabButton = ({ active, onClick, icon, label }) => {
  const Icon = icon;
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
        ${active
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 ring-2 ring-primary-200 ring-offset-1'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }
      `}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
      <span>{label}</span>
    </button>
  );
};

const PostList = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['posts', page, sort],
    queryFn: () => getPosts({ page, limit: 10, sort }),
    placeholderData: (previousData) => previousData,
  });

  const { mutate: toggleLike } = useLikePost();

  const posts = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
          <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit">
            <TabButton 
                active={sort === 'newest'} 
                onClick={() => setSort('newest')} 
                icon={Clock} 
                label="Mới nhất" 
            />
            <TabButton 
                active={sort === 'most_liked'} 
                onClick={() => setSort('most_liked')} 
                icon={TrendingUp} 
                label="Nổi bật" 
            />
          </div>
          
          <button className="flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-slate-800 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm transition-colors">
              <Filter className="w-4 h-4" />
              <span>Bộ lọc</span>
          </button>
      </div>

      {/* Feed Content */}
      <div className="space-y-5">
        {isLoading ? (
             <>
               <PostCardSkeleton />
               <PostCardSkeleton />
               <PostCardSkeleton />
             </>
        ) : isError ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">
                Có lỗi xảy ra khi tải bài viết.
            </div>
        ) : posts.length > 0 ? (
            posts.map((post) => (
                <PostCard 
                    key={post.id} 
                    post={post} 
                    onLike={(id) => toggleLike({ postId: id, isLiked: post.isLiked })} 
                />
            ))
        ) : (
             <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                <div className="mx-auto h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Filter className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Chưa có bài viết nào</h3>
                <p className="text-slate-500 mt-1">Hãy là người đầu tiên chia sẻ câu chuyện!</p>
             </div>
        )}
      </div>

      {/* Pagination (Tạm thời) */}
      <div className="flex justify-center pt-8 pb-4">
          <button 
            className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-full shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-all"
            onClick={() => setPage(p => p + 1)}
            disabled={posts.length < 10} // Simple check
          >
              Xem thêm bài viết
          </button>
      </div>
    </div>
  );
};



export default PostList;
