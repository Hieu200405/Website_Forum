import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '../api/postService';
import useModalStore from '@/components/hooks/useModalStore';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Image, X } from 'lucide-react';

const CreatePostModal = () => {
  const { onClose } = useModalStore();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ title: '', content: '', categoryId: 1 }); // Default category 1 for now

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      toast.success('Bài viết đã được đăng!');
      queryClient.invalidateQueries({ queryKey: ['posts'] }); // Refresh Feed
      setFormData({ title: '', content: '', categoryId: 1 });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Đăng bài thất bại');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    mutation.mutate(formData);
  };

  return (
    <Modal type="create-post" title="Tạo bài viết mới">
      <form onSubmit={handleSubmit} className="space-y-4">
         <div>
             <input 
                type="text" 
                placeholder="Tiêu đề bài viết..." 
                className="w-full text-lg font-bold placeholder:text-slate-400 border-none focus:ring-0 px-0 bg-transparent"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                autoFocus
             />
         </div>
         <div className="h-px bg-slate-100 w-full my-2"></div>
         <div>
             <textarea 
                placeholder="Bạn đang nghĩ gì thế? Chia sẻ chi tiết hơn nhé..." 
                className="w-full min-h-[150px] resize-none border-none focus:ring-0 px-0 text-slate-600 bg-transparent"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
             />
         </div>

         {/* Image Upload Placeholder */}
         <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
             <div className="flex items-center space-x-3 text-sm font-medium text-slate-700">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <Image className="w-5 h-5" />
                </div>
                <span>Thêm ảnh vào bài viết</span>
             </div>
         </div>

         <div className="flex justify-end pt-2">
             <Button type="submit" isLoading={mutation.isPending} className="w-full sm:w-auto px-8 rounded-full">
                Đăng bài
             </Button>
         </div>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
