import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePost, unlikePost } from '../api/postService';
import toast from 'react-hot-toast';
import useAuthStore from '@/features/auth/store/authStore';
import useModalStore from '@/components/hooks/useModalStore';

export const useLikePost = () => {
    const queryClient = useQueryClient();
    const token = useAuthStore((state) => state.token);
    const isAuthenticated = !!token;
    const { onOpen } = useModalStore();

    return useMutation({
        mutationFn: async ({ postId, isLiked }) => {
            console.log('[useLikePost] Mutation triggered:', { 
                postId, 
                isLiked, 
                isAuthenticated,
                token: token ? `${token.substring(0, 20)}...` : 'null'
            });
            
            if (!isAuthenticated) {
                console.warn('[useLikePost] Throwing UNAUTHENTICATED error');
                // Return a fake error to stop mutation logic and trigger login modal
                throw new Error('UNAUTHENTICATED');
            }
            if (isLiked) {
                return unlikePost(postId);
            } else {
                return likePost(postId);
            }
        },
        onMutate: async ({ postId, isLiked }) => {
            if (!isAuthenticated) return;

            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['posts'] });

            // Snapshot the previous value
            const previousPosts = queryClient.getQueryData(['posts']);

            // Optimistically update to the new value
            queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData) => {
                if (!oldData) return oldData;
                
                // Handling infinite query structure or standard array
                // Assuming standard pagination structure: { data: [...posts], ... } from our API
                // But PostList uses basic useQuery for now.
                
                // We need to support both single page and infinite query structures if we change later.
                // For now, let's look at PostList: const { data } = useQuery... const posts = data?.data || [];
                // So the cache structure is the response object { data: [], total: ... }

                // Note: We are updating all 'posts' queries.
                // This might be tricky if pages are different. 
                // A better approach for exact update is to iterate over all active queries.
                
                // Simplify: Just found the post in the current page data and update it.
                if (!oldData.data) return oldData;

                return {
                    ...oldData,
                    data: oldData.data.map(post => {
                        if (post.id === postId) {
                            return {
                                ...post,
                                isLiked: !isLiked,
                                likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1
                            };
                        }
                        return post;
                    })
                };
            });

            return { previousPosts };
        },
        onError: (err, newPost, context) => {
            if (err.message === 'UNAUTHENTICATED') {
                onOpen('login-required'); // We can impement this modal type or just redirect
                toast.error('Vui lòng đăng nhập để thực hiện');
                return;
            }
            // Rollback
            if (context?.previousPosts) {
                queryClient.setQueriesData({ queryKey: ['posts'] }, context.previousPosts);
            }
            toast.error('Có lỗi xảy ra khi like bài viết');
        },
        onSettled: () => {
             // Invalidate to refetch true data
             queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};
