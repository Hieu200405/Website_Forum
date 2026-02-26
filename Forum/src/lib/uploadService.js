import api from './axios';

export const uploadImage = async (formData) => {
    return await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
