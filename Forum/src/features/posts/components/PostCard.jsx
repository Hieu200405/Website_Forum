import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Heart, MessageSquare, Share2, Bookmark, Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostMenu from './PostMenu';
import { useDeletePost } from '../hooks/useDeletePost';
import { useSavePost } from '../hooks/useSavePost';
import useModalStore from '@/components/hooks/useModalStore';
import useAuthStore from '@/features/auth/store/authStore';
import { useFollow } from '@/hooks/useFollow';

const getTextFromHtml = (html) => {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    return doc.body.textContent || "";
};

const CATEGORY_COLORS = {
    'Thảo luận':    'bg-violet-100 text-violet-700',
    'Lập trình':    'bg-blue-100 text-blue-700',
    'Tin tức':      'bg-green-100 text-green-700',
    'Hỏi đáp':     'bg-amber-100 text-amber-800',
    'Mạng xã hội':  'bg-pink-100 text-pink-700',
    'Giải trí':     'bg-orange-100 text-orange-700',
};

const getCategoryColor = (cat) => CATEGORY_COLORS[cat] || 'bg-slate-100 text-slate-600';

const getBadge = (rep) => {
    if (rep >= 1000) return { label: 'Huyền thoại', emoji: '🌟', gradient: 'from-purple-500 via-pink-500 to-amber-400' };
    if (rep >= 500)  return { label: 'Chuyên gia',  emoji: '🔥', gradient: 'from-blue-500 to-cyan-500' };
    if (rep >= 100)  return { label: 'Đóng góp tích cực', emoji: '⭐', gradient: 'from-green-500 to-emerald-500' };
    if (rep >= 10)   return { label: 'Thành viên', emoji: '🌱', gradient: 'from-orange-400 to-amber-400' };
    return           { label: 'Tân binh',    emoji: '✨', gradient: 'from-slate-400 to-slate-500' };
};

const PostCard = ({ post, onLike }) => {
    const navigate = useNavigate();
    const deleteMutation = useDeletePost();
    const { mutate: toggleSave } = useSavePost();
    const { onOpen } = useModalStore();
    const { user: currentUser } = useAuthStore();
    const { follow, unfollow, isFollowingLoading } = useFollow();

    const handlePostClick = () => navigate(`/user/posts/${post.id}`);
    const likeCount  = Number(post.likeCount ?? post.likesCount ?? post.like_count ?? 0);
    const commentCount = Number(post.commentCount ?? post.commentsCount ?? post.comment_count ?? 0);

    const author = post.author || {};
    const rep = author.reputation || 0;
    const badge = getBadge(rep);
    const isOwnPost = currentUser && String(currentUser.id) === String(author.id);

    const handleFollow = (e) => {
        e.stopPropagation();
        if (!currentUser) return navigate('/login');
        if (author.isFollowing) {
            unfollow(author.id);
        } else {
            follow(author.id);
        }
    };

    return (
        <article className="group bg-white rounded-2xl border border-slate-100 hover:border-primary-200/60 transition-all duration-300 overflow-hidden"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.04)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 24px rgba(99,102,241,0.10)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.04)'}
        >
            <div className="p-5">
                {/* ─── Header ─── */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 cursor-pointer group/author"
                        onClick={e => { e.stopPropagation(); navigate(`/user/profile/${author.id}`); }}>
                        
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className={`h-11 w-11 rounded-full overflow-hidden ring-2 ring-white shadow-md bg-gradient-to-br ${badge.gradient}`}>
                                <img 
                                    src={author.avatar || `https://ui-avatars.com/api/?name=${author.username}&background=6366f1&color=fff&bold=true`} 
                                    alt="" 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 bg-gradient-to-r ${badge.gradient} text-white text-[8px] h-4 w-4 flex items-center justify-center rounded-full border border-white shadow-sm z-10`}>
                                {badge.emoji}
                            </div>
                        </div>

                        {/* Author info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover/author:text-primary-600 transition-colors truncate">
                                    {author.username || 'Ẩn danh'}
                                </h4>
                                
                                {/* Follow action */}
                                {!isOwnPost && author.id && (
                                    <button
                                        onClick={handleFollow}
                                        disabled={isFollowingLoading}
                                        className={`group/follow px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ring-offset-2 hover:ring-2 flex items-center gap-1.5 ${
                                            author.isFollowing
                                                ? 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-200 ring-red-100'
                                                : 'bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-600 hover:text-white ring-primary-100'
                                        }`}
                                    >
                                        {isFollowingLoading && <Loader2 size={10} className="animate-spin shrink-0" />}
                                        <span className="shrink-0">
                                            {author.isFollowing ? (
                                                <>
                                                    <span className="group-hover/follow:hidden">✓ Đã follow</span>
                                                    <span className="hidden group-hover/follow:inline">Bỏ follow</span>
                                                </>
                                            ) : (
                                                '+ Follow'
                                            )}
                                        </span>
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-slate-400">
                                    {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi }) : 'Vừa xong'}
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${getCategoryColor(post.category)}`}>
                                    {post.category || 'Thảo luận'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <PostMenu
                        post={post}
                        onEdit={() => onOpen('create-post', post)}
                        onDelete={() => {
                            if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) deleteMutation.mutate(post.id);
                        }}
                    />
                </div>

                {/* ─── Content ─── */}
                <div className="cursor-pointer md:pl-14" onClick={handlePostClick}>
                    <h3 className="text-[17px] font-bold text-slate-900 mb-2 leading-snug hover:text-primary-700 transition-colors line-clamp-2">
                        {post.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed text-sm mb-4 line-clamp-2">
                        {getTextFromHtml(post.content)}
                    </p>
                </div>

                {/* ─── Divider ─── */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent mx-5 mb-0 -mx-5" />
            </div>

            {/* ─── Action Bar (below divider) ─── */}
            <div className="px-5 py-3 flex items-center gap-1 bg-slate-50/30">
                {/* Like */}
                <ActionBtn
                    onClick={e => { e.stopPropagation(); onLike(post.id); }}
                    active={post.isLiked}
                    activeClass="text-red-500 bg-red-50"
                    hoverClass="hover:text-red-500 hover:bg-red-50/80"
                    icon={<Heart size={16} className={post.isLiked ? 'fill-current' : ''} />}
                    label={likeCount > 0 ? String(likeCount) : 'Thích'}
                />

                {/* Comment */}
                <ActionBtn
                    onClick={handlePostClick}
                    hoverClass="hover:text-primary-600 hover:bg-primary-50"
                    icon={<MessageSquare size={16} />}
                    label={commentCount > 0 ? `${commentCount} bình luận` : 'Bình luận'}
                />

                {/* Spacer */}
                <div className="flex-1" />

                {/* Share */}
                <ActionBtn
                    onClick={e => {
                        e.stopPropagation();
                        const url = `${window.location.origin}/user/posts/${post.id}`;
                        navigator.clipboard.writeText(url);
                        import('react-hot-toast').then(({ default: toast }) => toast.success('Đã copy link!', { icon: '🔗' }));
                    }}
                    hoverClass="hover:text-blue-600 hover:bg-blue-50"
                    icon={<Share2 size={16} />}
                />

                {/* Save */}
                <ActionBtn
                    onClick={e => { e.stopPropagation(); toggleSave({ postId: post.id, isSaved: post.isSaved }); }}
                    active={post.isSaved}
                    activeClass="text-primary-600 bg-primary-50"
                    hoverClass="hover:text-primary-600 hover:bg-primary-50"
                    icon={<Bookmark size={16} className={post.isSaved ? 'fill-current' : ''} />}
                    title={post.isSaved ? 'Đã lưu' : 'Lưu bài'}
                />
            </div>
        </article>
    );
};

const ActionBtn = ({ onClick, active, activeClass, hoverClass, icon, label, title }) => (
    <button
        onClick={onClick}
        title={title}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            active ? activeClass : `text-slate-500 ${hoverClass}`
        }`}
    >
        {icon}
        {label && <span>{label}</span>}
    </button>
);

export default PostCard;

