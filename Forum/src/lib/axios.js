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
    console.log('[Axios] Token from store:', token ? `${token.substring(0, 20)}...` : 'null');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios] Authorization header set');
    } else {
      console.warn('[Axios] No token found in store');
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
      console.error('[Axios] 401 Unauthorized - Logging out');
      console.error('[Axios] Request URL:', error.config?.url);
      console.error('[Axios] Response:', error.response?.data);
      // Auto logout using store action
      useAuthStore.getState().logout();
    }
    
    return Promise.reject({ ...error, message });
  }
);

export default api;
