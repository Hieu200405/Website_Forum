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
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <button 
                        onClick={() => navigate('/user')}
                        className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors backdrop-blur-md self-start md:self-center"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                               <Bookmark className="w-6 h-6 text-white fill-white" />
                           </div>
                           <h1 className="text-3xl font-extrabold text-white tracking-tight">Bộ sưu tập</h1>
                        </div>
                        <p className="text-indigo-100 text-lg">
                            Nơi lưu trữ những kiến thức quý giá và nội dung tâm đắc nhất của bạn.
                        </p>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-[-40px] right-[-20px] w-48 h-48 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
                <div className="absolute bottom-[-60px] left-[10%] w-64 h-64 bg-purple-400/20 rounded-full blur-3xl mix-blend-overlay"></div>
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
