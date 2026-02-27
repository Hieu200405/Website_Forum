import { useMutation, useQueryClient } from '@tanstack/react-query';
import { savePost, unsavePost } from '../api/postService';
import toast from 'react-hot-toast';

export const useSavePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, isSaved }) => {
            if (isSaved) {
                await unsavePost(postId);
            } else {
                await savePost(postId);
            }
            return { postId, isSaved: !isSaved };
        },
        onMutate: async ({ postId, isSaved }) => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: ['posts'] });
            await queryClient.cancelQueries({ queryKey: ['post', postId.toString()] });
            await queryClient.cancelQueries({ queryKey: ['savedPosts'] });

            const previousPosts = queryClient.getQueryData(['posts']);
            const previousPost = queryClient.getQueryData(['post', postId.toString()]);
            const previousSavedPosts = queryClient.getQueryData(['savedPosts']);

            // Generic update function for queries
            const updatePostPages = (oldData) => {
                if (!oldData) return oldData;
                
                // If the data has pages (infinite query)
                if (oldData.pages) {
                    return {
                        ...oldData,
                        pages: oldData.pages.map(page => ({
                            ...page,
                            data: Array.isArray(page.data) ? page.data.map(p => {
                                if (p.id === postId) return { ...p, isSaved: !isSaved };
                                return p;
                            }) : page.data
                        }))
                    };
                }
                
                // If it is a standard paginated response { data: [...] }
                if (Array.isArray(oldData.data)) {
                    return {
                        ...oldData,
                        data: oldData.data.map(p => {
                            if (p.id === postId) return { ...p, isSaved: !isSaved };
                            return p;
                        })
                    };
                }

                // If it is just an array
                if (Array.isArray(oldData)) {
                    return oldData.map(p => {
                        if (p.id === postId) return { ...p, isSaved: !isSaved };
                        return p;
                    });
                }
                
                return oldData;
            };

            // Update feed pages
            queryClient.setQueryData(['posts'], updatePostPages);
            
            // Update saved posts feed (remove item optimistically if unsaving context is in saved posts list, here we just invalidate later)
            queryClient.setQueryData(['savedPosts'], updatePostPages);

            // Update single post
            if (previousPost) {
                 queryClient.setQueryData(['post', postId.toString()], {
                     ...previousPost,
                     data: {
                         ...previousPost.data,
                         isSaved: !isSaved
                     }
                 });
            }

            return { previousPosts, previousPost, previousSavedPosts };
        },
        onError: (err, variables, context) => {
            if (context?.previousPosts) queryClient.setQueryData(['posts'], context.previousPosts);
            if (context?.previousPost) queryClient.setQueryData(['post', variables.postId.toString()], context.previousPost);
            if (context?.previousSavedPosts) queryClient.setQueryData(['savedPosts'], context.previousSavedPosts);
            toast.error('Không thể thao tác. Vui lòng thử lại.');
        },
        onSettled: () => {
            // Need to always invalidate savedPosts to ensure pagination integrity when we add/remove
            queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
        },
    });
};
