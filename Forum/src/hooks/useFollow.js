import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export const useFollow = () => {
    const queryClient = useQueryClient();

    const handleOptimisticUpdate = async (userId, isFollowing) => {
        const sid = String(userId);
        
        // 1. Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['posts'] });
        await queryClient.cancelQueries({ queryKey: ['post'] });
        await queryClient.cancelQueries({ queryKey: ['user-profile', sid] });

        // 2. Snapshot the previous values
        const prevPosts = queryClient.getQueriesData({ queryKey: ['posts'] });
        const prevUserProfile = queryClient.getQueryData(['user-profile', sid]);

        // 3. Optimistically update 'posts' cache
        queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData) => {
            if (!oldData) return oldData;
            const updateItem = (item) => {
                if (item.author && String(item.author.id) === sid) {
                    return { ...item, author: { ...item.author, isFollowing } };
                }
                return item;
            };

            if (Array.isArray(oldData)) return oldData.map(updateItem);
            if (oldData.data && Array.isArray(oldData.data)) {
                return { ...oldData, data: oldData.data.map(updateItem) };
            }
            return oldData;
        });

        // 4. Optimistically update 'user-profile' cache
        if (prevUserProfile) {
            queryClient.setQueryData(['user-profile', sid], (old) => {
                if (!old || !old.data) return old;
                return {
                    ...old,
                    data: { 
                        ...old.data, 
                        isFollowing,
                        followerCount: isFollowing ? (old.data.followerCount + 1) : Math.max(0, old.data.followerCount - 1)
                    }
                };
            });
        }

        return { prevPosts, prevUserProfile };
    };

    const followMutation = useMutation({
        mutationFn: async (userId) => {
            const response = await api.post(`/users/${userId}/follow`);
            return response.data;
        },
        onMutate: (userId) => handleOptimisticUpdate(userId, true),
        onError: (err, userId, context) => {
            if (context?.prevPosts) {
                context.prevPosts.forEach(([queryKey, oldData]) => {
                    queryClient.setQueryData(queryKey, oldData);
                });
            }
            if (context?.prevUserProfile) {
                queryClient.setQueryData(['user-profile', String(userId)], context.prevUserProfile);
            }
            toast.error(err.response?.data?.message || 'Không thể theo dõi');
        },
        onSettled: (data, err, userId) => {
            const sid = String(userId);
            queryClient.invalidateQueries({ queryKey: ['user-profile', sid] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post'] });
            queryClient.invalidateQueries({ queryKey: ['followers', sid] });
        }
    });

    const unfollowMutation = useMutation({
        mutationFn: async (userId) => {
            const response = await api.delete(`/users/${userId}/follow`);
            return response.data;
        },
        onMutate: (userId) => handleOptimisticUpdate(userId, false),
        onError: (err, userId, context) => {
            if (context?.prevPosts) {
                context.prevPosts.forEach(([queryKey, oldData]) => {
                    queryClient.setQueryData(queryKey, oldData);
                });
            }
            if (context?.prevUserProfile) {
                queryClient.setQueryData(['user-profile', String(userId)], context.prevUserProfile);
            }
            toast.error(err.response?.data?.message || 'Không thể bỏ theo dõi');
        },
        onSettled: (data, err, userId) => {
            const sid = String(userId);
            queryClient.invalidateQueries({ queryKey: ['user-profile', sid] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post'] });
            queryClient.invalidateQueries({ queryKey: ['followers', sid] });
        }
    });

    return {
        follow: followMutation.mutate,
        unfollow: unfollowMutation.mutate,
        isFollowingLoading: followMutation.isPending || unfollowMutation.isPending
    };
};
