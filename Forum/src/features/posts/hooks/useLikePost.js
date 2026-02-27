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
            if (!isAuthenticated) {
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
                
                // If it's a standard paginated response { data: [...] }
                if (Array.isArray(oldData.data)) {
                    return {
                        ...oldData,
                        data: oldData.data.map(post => {
                            if (post.id === postId) {
                                return {
                                    ...post,
                                    isLiked: !isLiked,
                                    likeCount: isLiked ? (post.likeCount || 1) - 1 : (post.likeCount || 0) + 1,
                                    likesCount: isLiked ? (post.likesCount || 1) - 1 : (post.likesCount || 0) + 1,
                                    like_count: isLiked ? (post.like_count || 1) - 1 : (post.like_count || 0) + 1
                                };
                            }
                            return post;
                        })
                    };
                }
                
                // If the data is just an array
                if (Array.isArray(oldData)) {
                    return oldData.map(post => {
                        if (post.id === postId) {
                            return {
                                ...post,
                                isLiked: !isLiked,
                                likeCount: isLiked ? (post.likeCount || 1) - 1 : (post.likeCount || 0) + 1,
                                likesCount: isLiked ? (post.likesCount || 1) - 1 : (post.likesCount || 0) + 1,
                                like_count: isLiked ? (post.like_count || 1) - 1 : (post.like_count || 0) + 1
                            };
                        }
                        return post;
                    });
                }

                return oldData;
            });

            // Cancel and Snapshot the previous single post value
            await queryClient.cancelQueries({ queryKey: ['post', postId.toString()] });
            const previousPost = queryClient.getQueryData(['post', postId.toString()]);
            
            // Optimistically update the single post
            if (previousPost) {
                 queryClient.setQueryData(['post', postId.toString()], {
                     ...previousPost,
                     data: {
                         ...previousPost.data,
                         isLiked: !isLiked,
                         likeCount: isLiked ? (previousPost.data.likeCount || 1) - 1 : (previousPost.data.likeCount || 0) + 1,
                         likesCount: isLiked ? (previousPost.data.likesCount || 1) - 1 : (previousPost.data.likesCount || 0) + 1,
                         like_count: isLiked ? (previousPost.data.like_count || 1) - 1 : (previousPost.data.like_count || 0) + 1
                     }
                 });
            }

            return { previousPosts, previousPost };
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
            if (context?.previousPost) {
                queryClient.setQueryData(['post', newPost.postId.toString()], context.previousPost);
            }
            toast.error('Có lỗi xảy ra khi like bài viết');
        },
        onSettled: () => {
             // Invalidate to refetch true data
             queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
};
