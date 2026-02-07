
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '@/features/posts/api/postService';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Image, ArrowLeft } from 'lucide-react';

const CreatePost = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ 
      title: '', 
      content: '', 
      categoryId: 1 
  });

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      toast.success('Bài viết đã được đăng!');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate('/user');
    },
    onError: (error) => {
      toast.error(error.message || 'Thao tác thất bại');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/user')} className="flex items-center space-x-2 text-slate-500 mb-6 hover:text-primary-600 transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Tạo bài viết mới</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề</label>
                    <input 
                        type="text" 
                        placeholder="Tiêu đề bài viết..." 
                        className="w-full text-lg font-bold placeholder:text-slate-400 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        autoFocus
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                    <textarea 
                        placeholder="Bạn đang nghĩ gì thế? Chia sẻ chi tiết hơn nhé..." 
                        className="w-full min-h-[300px] resize-none border border-slate-200 rounded-xl px-4 py-3 text-slate-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={mutation.isPending} className="px-8 rounded-full shadow-lg shadow-primary-500/30">
                        Đăng bài viết
                    </Button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default CreatePost;
