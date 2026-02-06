import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { register } from '../api/authService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const RegisterForm = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    },
    onError: (error) => {
       toast.error(error.message || 'Đăng ký thất bại');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
        <Input 
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          placeholder="username"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <Input 
          type="email" 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="email@example.com"
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
        Đăng ký
      </Button>
    </form>
  );
};

export default RegisterForm;
