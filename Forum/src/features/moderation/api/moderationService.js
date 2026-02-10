
import api from '@/lib/axios';

export const getReports = async () => {
    // GET /api/admin/reports
    const response = await api.get('/admin/reports');
    return response.data || [];
};

export const moderatePost = async (postId, action, reason) => {
    // PATCH /api/moderation/posts/:postId
    const response = await api.patch(`/moderation/posts/${postId}`, { action, reason });
    return response.data;
};

export const reportPost = async (postId, { reason }) => {
    const response = await api.post(`/posts/${postId}/report`, { reason });
    return response.data;
};

export const getModerationStats = async () => {
    const response = await api.get('/moderation/stats');
    return response.data;
};
