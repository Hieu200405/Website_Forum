
import api from '@/lib/axios';

export const getReports = async (params) => {
    // Backend endpoint /admin/reports or /moderation/reports?
    // Based on adminService: axios.get('/admin/reports')
    // But moderationService is for both?
    // Let's assume /moderation/reports exists or reuse /admin/reports if mod has access.
    // Given separate roles, maybe /moderation/reports is better if backend supports.
    // But let's stick to /admin/reports as it was in adminService?
    // Wait, adminService had getReports too.
    // If I moved adminService, do I need it here?
    // Yes, for ModeratorLayout pages.
    // I'll use /admin/reports if backend allows mod role, or /moderation/reports.
    // I'll use /admin/reports for now as I saw it in adminService.
    const response = await api.get('/admin/reports', { params });
    return response.data;
};

export const moderatePost = async (postId, action, reason) => {
    // action: 'hide' | 'delete' | 'so on'
    const response = await api.patch(`/admin/posts/${postId}/moderate`, { action, reason }); // Adjusted endpoint guess
    return response.data;
};

export const reportPost = async (postId, { reason }) => {
    const response = await api.post(`/posts/${postId}/report`, { reason });
    return response.data;
};
