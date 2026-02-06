import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Errors (401, etc)
api.interceptors.response.use(
  (response) => response.data, // Return data directly for easier consumption
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    if (error.response?.status === 401) {
      // Auto logout if 401 (Token Expired)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login handled by AuthGuard component usually
      // window.location.href = '/login'; // Optional: force redirect
    }
    
    return Promise.reject({ ...error, message });
  }
);

export default api;
