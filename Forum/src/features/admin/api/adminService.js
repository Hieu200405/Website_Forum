
import axios from '@/lib/axios';

export const getUsers = async (params) => {
    const response = await axios.get('/admin/users', { params });
    return response.data;
};

export const getPosts = async (params) => {
    const response = await axios.get('/admin/posts', { params });
    return response.data;
};

export const getAdminStats = async () => {
    const response = await axios.get('/admin/stats');
    return response.data;
};

export const banUser = async ({ userId, reason }) => {
    const response = await axios.patch(`/admin/users/${userId}/ban`, { reason });
    return response.data;
};

export const unbanUser = async (userId) => {
    const response = await axios.patch(`/admin/users/${userId}/unban`);
    return response.data;
};

export const getReports = async (params) => {
    const response = await axios.get('/admin/reports', { params });
    return response.data;
};

export const getSystemLogs = async (params) => {
    // API log logs
    const response = await axios.get('/admin/logs', { params });
    return response.data;
};
