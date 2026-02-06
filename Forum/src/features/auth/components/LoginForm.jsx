import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { login } from '../api/authService';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Need to setup Toaster
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const setAuth = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Backend returns { success: true, accessToken, user }
      setAuth(data.user, data.accessToken);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    },
    onError: (error) => {
        // Error from axios interceptor: { message, ... }
        if (error.response?.status === 429) {
           toast.error('Gửi quá nhiều yêu cầu. Vui lòng chờ.');
        } else {
           toast.error(error.message || 'Đăng nhập thất bại');
        }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <Input 
          type="email" 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="admin@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
        <Input 
          type="password" 
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          placeholder="••••••••"
          required
        />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        isLoading={mutation.isPending}
      >
        Đăng nhập
      </Button>
    </form>
  );
};

export default LoginForm;
