import axios from 'axios';
import useAuthStore from '@/features/auth/store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    // Get token directly from Store (Single Source of Truth)
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Errors (401, etc)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    if (error.response?.status === 401) {
      // Auto logout using store action
      useAuthStore.getState().logout();
    }
    
    return Promise.reject({ ...error, message });
  }
);

export default api;
