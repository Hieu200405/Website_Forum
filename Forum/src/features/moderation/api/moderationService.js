
import axios from '@/services/api';

export const moderatePost = async (postId, { action, reason }) => {
    const response = await axios.patch(`/moderation/posts/${postId}`, { action, reason });
    return response.data;
};

export const reportPost = async (postId, { reason }) => {
    const response = await axios.post(`/posts/${postId}/report`, { reason });
    return response.data;
};
