import axios from '@/lib/axios';

export const getUsers = async (params) => {
    const response = await axios.get('/admin/users', { params });
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
