import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost } from '../api/postService';
import toast from 'react-hot-toast';

export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
             toast.success('Đã xóa bài viết');
             queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (err) => {
             toast.error(err?.response?.data?.message || 'Không thể xóa bài viết');
        }
    });
};
