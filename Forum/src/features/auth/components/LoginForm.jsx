import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GoogleLogin } from '@react-oauth/google';
import { login, googleLogin } from '../api/authService';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Need to setup Toaster
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const setAuth = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLoginSuccess = (data) => {
      const user = { ...data.user, role: data.user.role.toLowerCase() };
      setAuth(user, data.accessToken);
      toast.success('Đăng nhập thành công!');
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'moderator') {
        navigate('/moderator');
      } else {
        navigate('/user');
      }
  };

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: handleLoginSuccess,
    onError: (error) => {
        // Error from axios interceptor: { message, ... }
        if (error.response?.status === 429) {
           toast.error('Gửi quá nhiều yêu cầu. Vui lòng chờ.');
        } else {
           toast.error(error.message || 'Đăng nhập thất bại');
        }
    }
  });
  const googleMutation = useMutation({
    mutationFn: (token) => googleLogin(token),
    onSuccess: handleLoginSuccess,
    onError: (error) => {
        toast.error(error.message || 'Đăng nhập Google thất bại');
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
        isLoading={mutation.isPending || googleMutation.isPending}
      >
        Đăng nhập
      </Button>
      
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
             <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
             <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
        </div>
      </div>

      <div className="flex justify-center flex-col items-center">
          <GoogleLogin
              onSuccess={credentialResponse => {
                  googleMutation.mutate(credentialResponse.credential);
              }}
              onError={() => {
                  toast.error('Gặp lỗi khi truy cập Google');
              }}
              useOneTap
          />
      </div>
    </form>
  );
};

export default LoginForm;
