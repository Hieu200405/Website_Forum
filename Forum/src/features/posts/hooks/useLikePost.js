import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePost, unlikePost } from '../api/postService';
import toast from 'react-hot-toast';
import useAuthStore from '@/features/auth/store/authStore';
import useModalStore from '@/components/hooks/useModalStore';

export const useLikePost = () => {
    const queryClient = useQueryClient();
    const token = useAuthStore((state) => state.token);
    const { onOpen } = useModalStore();

    return useMutation({
        mutationFn: async ({ postId, isLiked }) => {
            if (!token) throw new Error('UNAUTHENTICATED');
            return isLiked ? unlikePost(postId) : likePost(postId);
        },
        onMutate: async ({ postId, isLiked }) => {
            const pid = Number(postId);
            
            // 1. Cancel related queries
            await queryClient.cancelQueries({ queryKey: ['posts'] });
            await queryClient.cancelQueries({ queryKey: ['post', pid] });
            await queryClient.cancelQueries({ queryKey: ['post', pid.toString()] });

            // 2. Snapshot current state
            const previousQueries = queryClient.getQueriesData({ queryKey: ['posts'] });
            const previousPost = queryClient.getQueryData(['post', pid.toString()]);

            // 3. Define the update logic for any post list/object
            const getUpdatedPost = (post) => {
                const diff = isLiked ? -1 : 1;
                
                // Be extremely defensive with naming variations
                const currentCount = Number(post.likeCount ?? post.likesCount ?? post.like_count ?? 0);
                const newCount = Math.max(0, currentCount + diff);
                
                return {
                    ...post,
                    likeCount: newCount,
                    likesCount: newCount,
                    like_count: newCount,
                    commentCount: post.commentCount ?? post.commentsCount ?? post.comment_count ?? 0,
                    commentsCount: post.commentCount ?? post.commentsCount ?? post.comment_count ?? 0,
                    isLiked: !isLiked,
                };
            };

            // 4. Perform Optimistic Update on all 'posts' queries
            queryClient.setQueriesData({ queryKey: ['posts'] }, (old) => {
                if (!old) return old;
                // Infinite Query
                if (old.pages) {
                    return {
                        ...old,
                        pages: old.pages.map(page => {
                            const updateArr = (arr) => arr.map(p => Number(p.id) === pid ? getUpdatedPost(p) : p);
                            if (Array.isArray(page.data)) return { ...page, data: updateArr(page.data) };
                            if (Array.isArray(page)) return updateArr(page);
                            return page;
                        })
                    };
                }
                // Standard Array or Object with data array
                const target = Array.isArray(old.data) ? old.data : (Array.isArray(old) ? old : null);
                if (target) {
                    const newList = target.map(p => Number(p.id) === pid ? getUpdatedPost(p) : p);
                    return Array.isArray(old.data) ? { ...old, data: newList } : newList;
                }
                return old;
            });

            // 5. Update Single Post Detail
            if (previousPost) {
                queryClient.setQueryData(['post', pid.toString()], (old) => {
                    const current = old?.data || old;
                    if (!current) return old;
                    const updated = getUpdatedPost(current);
                    return old.data ? { ...old, data: updated } : updated;
                });
            }

            return { previousQueries, previousPost };
        },
        onSuccess: (serverData, variables) => {
            // serverData is already the data because of axios interceptor
            if (!serverData || typeof serverData.isLiked === 'undefined') return;

            const pid = Number(variables.postId);

            // Sync all caches with SOURCE OF TRUTH from server
            const syncFn = (post) => {
                if (Number(post.id) !== pid) return post;
                return { 
                    ...post, 
                    isLiked: serverData.isLiked, 
                    likeCount: serverData.likeCount, 
                    like_count: serverData.likeCount,
                    likesCount: serverData.likeCount 
                };
            };

            queryClient.setQueriesData({ queryKey: ['posts'] }, (old) => {
                if (!old) return old;
                if (old.pages) {
                    return {
                        ...old,
                        pages: old.pages.map(page => {
                            if (Array.isArray(page.data)) return { ...page, data: page.data.map(syncFn) };
                            if (Array.isArray(page)) return page.map(syncFn);
                            return page;
                        })
                    };
                }
                const target = Array.isArray(old.data) ? old.data : (Array.isArray(old) ? old : null);
                if (target) {
                    const newList = target.map(syncFn);
                    return Array.isArray(old.data) ? { ...old, data: newList } : newList;
                }
                return old;
            });

            queryClient.setQueryData(['post', pid.toString()], (old) => {
                const current = old?.data || old;
                if (!current) return old;
                const updated = { 
                    ...current, 
                    isLiked: serverData.isLiked, 
                    likeCount: serverData.likeCount, 
                    like_count: serverData.likeCount,
                    likesCount: serverData.likeCount 
                };
                return old.data ? { ...old, data: updated } : updated;
            });
        },
        onError: (err, variables, context) => {
            if (err.message === 'UNAUTHENTICATED') {
                onOpen('login-required');
                toast.error('Vui lòng đăng nhập để thực hiện');
            } else {
                toast.error('Có lỗi xảy ra khi like bài viết');
            }

            if (context?.previousQueries) {
                context.previousQueries.forEach(([key, old]) => queryClient.setQueryData(key, old));
            }
            if (context?.previousPost) {
                queryClient.setQueryData(['post', variables.postId.toString()], context.previousPost);
            }
        },
        onSettled: (_, __, variables) => {
            const sid = variables.postId.toString();
            const nid = Number(variables.postId);
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post', sid] });
            queryClient.invalidateQueries({ queryKey: ['post', nid] });
        }
    });
};
