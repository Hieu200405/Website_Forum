import api from '@/lib/axios';

export const login = async (credentials) => {
  // credentials: { email, password }
  return await api.post('/auth/login', credentials);
};

export const register = async (userData) => {
  // userData: { username, email, password }
  return await api.post('/auth/register', userData);
};
