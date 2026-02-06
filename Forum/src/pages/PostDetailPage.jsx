import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPostDetail } from '../features/posts/api/commentService';
import { useLikePost } from '../features/posts/hooks/useLikePost';
import PostCardSkeleton from '../features/posts/components/PostSkeleton';
import CommentSection from '../features/posts/components/CommentSection';
import { ArrowLeft, Clock, Calendar, Heart, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mutate: toggleLike } = useLikePost();

  const { data, isLoading, isError } = useQuery({
      queryKey: ['post', id],
      queryFn: () => getPostDetail(id),
      retry: 1
  });

  const post = data?.data;

  if (isLoading) return (
      <div className="max-w-4xl mx-auto pt-24 px-4 pb-10">
          <PostCardSkeleton />
      </div>
  );

  if (isError || !post) return (
      <div className="min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy bài viết</h2>
          <button onClick={() => navigate('/')} className="mt-4 text-primary-600 hover:underline">Quay về trang chủ</button>
      </div>
  );

  return (
      <div className="min-h-screen bg-slate-50 pt-[80px] pb-20 font-sans">
          <div className="max-w-4xl mx-auto px-4 lg:px-0">
              {/* Back Button */}
              <button 
                onClick={() => navigate('/')}
                className="mb-6 flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
              >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Quay lại bảng tin</span>
              </button>

              {/* Main Post Content */}
              <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-6 md:p-8 border-b border-slate-50">
                      <div className="flex items-center space-x-4 mb-6">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-primary-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                                {post.author?.username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                              <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                                  {post.title}
                              </h1>
                              <div className="flex items-center text-sm text-slate-500 mt-1 space-x-3">
                                  <span className="font-semibold text-primary-600">{post.author?.username}</span>
                                  <span>•</span>
                                  <span>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi }) : ''}</span>
                                  <span>•</span>
                                  <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">{post.category || 'General'}</span>
                              </div>
                          </div>
                      </div>

                      {/* Post Body */}
                      <div className="prose prose-slate max-w-none text-slate-800 leading-8 text-[16px]">
                          {post.content.split('\n').map((line, i) => (
                              <p key={i} className="mb-4">{line}</p>
                          ))}
                      </div>
                  </div>

                  {/* Interaction Bar */}
                    <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                        <div className="flex items-center space-x-6">
                            <button 
                                onClick={() => toggleLike({ postId: post.id, isLiked: post.isLiked })}
                                className="flex items-center space-x-2 group text-slate-500 hover:text-red-500 transition-colors"
                            >
                                <div className="p-2 bg-white rounded-full shadow-sm group-hover:shadow border border-slate-100 group-hover:bg-red-50">
                                    <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                </div>
                                <span className="font-bold text-lg">{post.likeCount}</span>
                            </button>
                            
                            <div className="flex items-center space-x-2 text-slate-500">
                                <div className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-lg">{post.commentCount}</span>
                            </div>
                        </div>

                        <button className="flex items-center space-x-2 text-slate-400 hover:text-slate-600">
                            <Share2 className="w-5 h-5" />
                            <span className="font-medium text-sm hidden sm:inline">Chia sẻ</span>
                        </button>
                    </div>
              </article>

              {/* Comments Section */}
              <CommentSection postId={post.id} />
          </div>
      </div>
  );
};

export default PostDetailPage;
