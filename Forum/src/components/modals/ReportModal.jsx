
import React, { useState } from 'react';
import useModalStore from '@/components/hooks/useModalStore';
import { useMutation } from '@tanstack/react-query';
import { reportPost } from '@/features/moderation/api/moderationService';
import toast from 'react-hot-toast';
import { X, Send, AlertTriangle } from 'lucide-react';

const ReportModal = () => {
    const { isOpen, type, data, onClose } = useModalStore();
    const [reason, setReason] = useState('');
    
    // Only render if type is 'report-post'
    const isModalOpen = isOpen && type === 'report-post';

    // State management handled by component lifecycle or manual reset


    const mutation = useMutation({
        mutationFn: ({ postId, reason }) => reportPost(postId, { reason }),
        onSuccess: () => {
            toast.success('Đã gửi báo cáo vi phạm!');
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    if (!isModalOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) return;
        mutation.mutate({ postId: data.postId, reason });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-red-50">
                    <h3 className="font-bold text-red-700 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Báo cáo vi phạm
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-red-100 rounded-full text-red-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-slate-600 mb-4 text-sm">
                        Hãy cho chúng tôi biết lý do bạn báo cáo bài viết này. Chúng tôi sẽ xem xét trong thời gian sớm nhất.
                    </p>
                    
                    <div className="space-y-3 mb-6">
                        {['Nội dung không phù hợp', 'Spam / Quảng cáo', 'Thông tin sai lệch', 'Ngôn từ thù địch', 'Khác'].map((r) => (
                            <label key={r} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all">
                                <input 
                                    type="radio" 
                                    name="reason" 
                                    value={r}
                                    checked={reason === r}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-slate-700">{r}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-sm transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            disabled={!reason || mutation.isPending}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-red-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {mutation.isPending ? 'Đang gửi...' : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Gửi báo cáo
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
