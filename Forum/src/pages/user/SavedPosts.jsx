import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSavedPosts } from '@/features/posts/api/postService';
import PostCard from '@/features/posts/components/PostCard';
import PostCardSkeleton from '@/features/posts/components/PostSkeleton';
import { useLikePost } from '@/features/posts/hooks/useLikePost';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SavedPostsList = () => {
    const navigate = useNavigate();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['savedPosts'],
        queryFn: () => getSavedPosts({ page: 1, limit: 100 }), // Simplified pagination for saved posts
    });

    const { mutate: toggleLike } = useLikePost();
    const savedPosts = data?.data || [];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <button 
                    onClick={() => navigate('/user')}
                    className="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-sm border border-slate-100 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3 text-slate-800">
                    <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                        <Bookmark className="w-6 h-6 fill-current text-primary-500" />
                    </div>
                    <h1 className="text-2xl font-bold">Bài viết đã lưu</h1>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <>
                        <PostCardSkeleton />
                        <PostCardSkeleton />
                    </>
                ) : isError ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">
                        Có lỗi xảy ra khi tải danh sách đã lưu.
                    </div>
                ) : savedPosts.length > 0 ? (
                    savedPosts.map((post) => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            onLike={(id) => toggleLike({ postId: id, isLiked: post.isLiked })} 
                        />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="mx-auto h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Bookmark className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Chưa có bài viết nào được lưu</h3>
                        <p className="text-slate-500 mt-1 cursor-pointer hover:text-primary-600 transition-colors" onClick={() => navigate('/user')}>
                           Quay lại bảng tin để khám phá ngay!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedPostsList;
