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
            const pid = Number(postId);
            const sid = postId.toString();

            // 1. Cancel related queries
            await Promise.all([
                queryClient.cancelQueries({ queryKey: ['posts'] }),
                queryClient.cancelQueries({ queryKey: ['savedPosts'] }),
                queryClient.cancelQueries({ queryKey: ['post', sid] }),
                queryClient.cancelQueries({ queryKey: ['post', pid] })
            ]);

            // 2. Snapshot state for rollback
            const previousQueries = queryClient.getQueriesData({ queryKey: [] }); // Get all for broad safety or specific keys

            // 3. Define the update logic
            const getUpdatedPost = (post) => ({
                ...post,
                isSaved: !isSaved,
                is_saved: !isSaved
            });

            const syncCache = (key) => {
                queryClient.setQueriesData({ queryKey: [key] }, (old) => {
                    if (!old) return old;
                    // Infinite Query
                    if (old.pages) {
                        return {
                            ...old,
                            pages: old.pages.map(page => {
                                const updateArr = (arr) => arr.map(p => (Number(p.id) === pid) ? getUpdatedPost(p) : p);
                                if (Array.isArray(page.data)) return { ...page, data: updateArr(page.data) };
                                if (Array.isArray(page)) return updateArr(page);
                                return page;
                            })
                        };
                    }
                    // Standard List
                    const target = Array.isArray(old.data) ? old.data : (Array.isArray(old) ? old : null);
                    if (target) {
                        const newList = target.map(p => (Number(p.id) === pid) ? getUpdatedPost(p) : p);
                        return Array.isArray(old.data) ? { ...old, data: newList } : newList;
                    }
                    return old;
                });
            };

            // 4. Update all relevant feed types
            syncCache('posts');
            syncCache('savedPosts');

            // 5. Update Single Post Detail (Checking both string and numeric ID patterns)
            [sid, pid].forEach(id => {
                queryClient.setQueryData(['post', id.toString()], (old) => {
                    const current = old?.data || old;
                    if (!current) return old;
                    const updated = getUpdatedPost(current);
                    return old.data ? { ...old, data: updated } : updated;
                });
            });

            return { previousQueries };
        },
        onSuccess: (serverData, variables) => {
            // serverData is already the data because of axios interceptors
            if (!serverData || typeof serverData.isSaved === 'undefined') return;

            const pid = Number(variables.postId);
            const sid = variables.postId.toString();

            const syncFn = (post) => {
                if (Number(post.id) !== pid) return post;
                return { 
                    ...post, 
                    isSaved: serverData.isSaved,
                    is_saved: serverData.isSaved
                };
            };

            const finalizeCache = (key) => {
                queryClient.setQueriesData({ queryKey: [key] }, (old) => {
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
            };

            finalizeCache('posts');
            finalizeCache('savedPosts');

            [sid, pid].forEach(id => {
                queryClient.setQueryData(['post', id.toString()], (old) => {
                    const current = old?.data || old;
                    if (!current) return old;
                    const updated = { ...current, isSaved: serverData.isSaved, is_saved: serverData.isSaved };
                    return old.data ? { ...old, data: updated } : updated;
                });
            });
        },
        onError: (err, variables, context) => {
            // Rollback everything from broad snapshot if needed, or specific bits
            if (context?.previousQueries) {
                context.previousQueries.forEach(([key, old]) => queryClient.setQueryData(key, old));
            }
            toast.error('Có lỗi xảy ra khi thao tác với bài viết');
        },
        onSettled: (data, error, variables) => {
            const sid = variables.postId.toString();
            const pid = Number(variables.postId);
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
            queryClient.invalidateQueries({ queryKey: ['post', sid] });
            queryClient.invalidateQueries({ queryKey: ['post', pid.toString()] });
        }
    });
};
