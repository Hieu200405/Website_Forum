
import React from 'react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import "highlight.js/styles/atom-one-dark.css";
import { useQuery } from '@tanstack/react-query';
import { getPostDetail } from '@/features/posts/api/commentService';
import { useLikePost } from '@/features/posts/hooks/useLikePost';
import { useSavePost } from '@/features/posts/hooks/useSavePost';
import { useDeletePost } from '@/features/posts/hooks/useDeletePost';
import PostCardSkeleton from '@/features/posts/components/PostSkeleton';
import CommentSection from '@/features/posts/components/CommentSection';
import PostMenu from '@/features/posts/components/PostMenu';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import { useFollow } from '@/hooks/useFollow';
import useAuthStore from '@/features/auth/store/authStore';
import useModalStore from '@/components/hooks/useModalStore';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowLeft, Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';

const getBadge = (rep) => {
    if (rep >= 1000) return { label: 'Huyền thoại', emoji: '🌟', gradient: 'from-purple-500 via-pink-500 to-amber-400' };
    if (rep >= 500)  return { label: 'Chuyên gia',  emoji: '🔥', gradient: 'from-blue-500 to-cyan-500' };
    if (rep >= 100)  return { label: 'Đóng góp tích cực', emoji: '⭐', gradient: 'from-green-500 to-emerald-500' };
    if (rep >= 10)   return { label: 'Thành viên', emoji: '🌱', gradient: 'from-orange-400 to-amber-400' };
    return           { label: 'Tân binh',    emoji: '✨', gradient: 'from-slate-400 to-slate-500' };
};

const UserPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mutate: toggleLike } = useLikePost();
  const { mutate: toggleSave } = useSavePost();
  const deleteMutation = useDeletePost();
  const { user: currentUser } = useAuthStore();
  const { onOpen } = useModalStore();
  const { follow, unfollow, isFollowingLoading } = useFollow();

  const { data, isLoading, isError } = useQuery({
      queryKey: ['post', id],
      queryFn: () => getPostDetail(id),
      retry: 1
  });

  const post = data?.data;
  const author = post?.author || {};
  const badge = getBadge(author.reputation || 0);
  const isOwnPost = currentUser && String(currentUser.id) === String(author.id);

  const handleFollow = (e) => {
    e.stopPropagation();
    if (!currentUser) return navigate('/login');
    if (author.isFollowing) unfollow(author.id);
    else follow(author.id);
  };

  if (isLoading) return (
      <div className="max-w-4xl mx-auto pt-10 px-4 pb-10">
          <PostCardSkeleton />
      </div>
  );

  if (isError || !post) {
      return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy bài viết</h2>
          <button onClick={() => navigate('/user')} className="mt-4 text-primary-600 hover:underline">Quay về bảng tin</button>
      </div>
  );
  }

  // Function to extract text from HTML for meta description
  const getTextFromHtml = (html) => {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    return doc.body.textContent || "";
  };

  const plainExcerpt = post?.content ? getTextFromHtml(post.content).substring(0, 160) + '...' : 'Diễn đàn chia sẻ kiến thức trực tuyến';

  return (
      <>
      <ReadingProgressBar />
      <div className="max-w-4xl mx-auto pt-4 px-4 sm:px-6">
          <Helmet>
              <title>{post.title} | Forum</title>
              <meta name="description" content={plainExcerpt} />
              <meta property="og:title" content={post.title} />
              <meta property="og:description" content={plainExcerpt} />
              <meta property="og:type" content="article" />
          </Helmet>

          {/* Back Button */}
          <button 
            onClick={() => navigate('/user')}
            className="mb-6 flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại bảng tin</span>
          </button>

          {/* Main Post Content */}
          <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
              {/* Post Header */}
              <div className="p-6 md:p-8 border-b border-slate-50">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                      <div className="flex items-start space-x-4 flex-1">
                          <div className="relative shrink-0">
                            <div 
                                className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br ${badge.gradient} text-white flex items-center justify-center font-bold text-xl shadow-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all`}
                                onClick={(e) => { e.stopPropagation(); navigate(`/user/profile/${author.id}`); }}
                            >
                                <img 
                                    src={author.avatar || `https://ui-avatars.com/api/?name=${author.username}&background=random`} 
                                    alt="Avatar" 
                                    className="h-full w-full object-cover" 
                                />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 bg-gradient-to-r ${badge.gradient} text-white text-[9px] h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10 font-bold`}>
                                {badge.emoji}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                              <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-2">
                                  {post.title}
                              </h1>
                              <div className="flex flex-wrap items-center text-sm text-slate-500 gap-3">
                                  <div className="flex items-center gap-2">
                                    <span 
                                        className="font-black text-primary-600 cursor-pointer hover:underline"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/user/profile/${author.id}`); }}
                                    >
                                        {author.username}
                                    </span>
                                    
                                    {!isOwnPost && author.id && (
                                        <button
                                            onClick={handleFollow}
                                            disabled={isFollowingLoading}
                                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border shrink-0 ${
                                                author.isFollowing
                                                    ? 'bg-slate-50 text-slate-400 border-slate-100'
                                                    : 'bg-primary-50 text-primary-600 border-primary-100 hover:bg-primary-600 hover:text-white'
                                            }`}
                                        >
                                            {isFollowingLoading ? '...' : author.isFollowing ? '✓ Đã follow' : '+ Follow'}
                                        </button>
                                    )}
                                  </div>
                                  <span className="hidden sm:inline text-slate-300 font-light">•</span>
                                  <span className="text-[13px]">{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi }) : ''}</span>
                                  <span className="hidden sm:inline text-slate-300 font-light">•</span>
                                  <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">{post.category?.name || 'Chung'}</span>
                              </div>
                          </div>
                      </div>
                      
                      {/* Post Menu */}
                      {currentUser && (
                          <div className="shrink-0 self-end sm:self-start">
                            <PostMenu 
                                post={post}
                                onEdit={() => onOpen('create-post', post)}
                                onDelete={() => {
                                    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
                                        deleteMutation.mutate(post.id, {
                                            onSuccess: () => navigate('/user')
                                        });
                                    }
                                }}
                            />
                          </div>
                      )}
                  </div>

                  {/* Post Body */}
                  <div id="post-content" className="prose prose-slate max-w-none text-slate-800 leading-8 text-[16px] ql-editor px-0">
                      {parse(DOMPurify.sanitize(post.content || ''))}
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
                            <span className="font-bold text-lg">{Number(post.likeCount ?? post.likesCount ?? post.like_count ?? 0)}</span>
                        </button>
                        
                        <div className="flex items-center space-x-2 text-slate-500">
                            <div className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-lg">{Number(post.commentCount ?? post.commentsCount ?? post.comment_count ?? 0)}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => toggleSave({ postId: post.id, isSaved: post.isSaved })}
                            className="flex items-center space-x-2 text-slate-400 hover:text-primary-600 transition-colors mr-4"
                        >
                            <Bookmark className={`w-5 h-5 ${post.isSaved ? 'fill-primary-500 text-primary-500' : ''}`} />
                            <span className="font-medium text-sm hidden sm:inline">{post.isSaved ? 'Đã lưu' : 'Lưu bài'}</span>
                        </button>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                import('react-hot-toast').then(({ default: toast }) => toast.success('Đã copy link!'));
                            }}
                            className="flex items-center space-x-2 text-slate-400 hover:text-slate-600"
                        >
                            <Share2 className="w-5 h-5" />
                            <span className="font-medium text-sm hidden sm:inline">Chia sẻ</span>
                        </button>
                    </div>
                </div>
          </article>

          {/* Comments Section */}
          <CommentSection postId={post.id} postAuthorId={author.id} />
      </div>
      </>
  );
};

export default UserPostDetail;
