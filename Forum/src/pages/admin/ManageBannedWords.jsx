import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/ui/Button';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBannedWords, addBannedWord, deleteBannedWord } from '@/features/admin/api/adminService';

const ManageBannedWords = () => {
    const queryClient = useQueryClient();
    const [newWord, setNewWord] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-banned-words'],
        queryFn: getBannedWords
    });

    const addMutation = useMutation({
        mutationFn: addBannedWord,
        onSuccess: () => {
            toast.success('Đã thêm từ cấm mới');
            setNewWord('');
            queryClient.invalidateQueries({ queryKey: ['admin-banned-words'] });
        },
        onError: (err) => {
            toast.error(err.message || 'Thêm thất bại');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteBannedWord,
        onSuccess: () => {
            toast.success('Đã xóa từ cấm');
            queryClient.invalidateQueries({ queryKey: ['admin-banned-words'] });
        },
        onError: (err) => {
            toast.error(err.message || 'Xóa thất bại');
        }
    });

    const handleAdd = (e) => {
        e.preventDefault();
        const word = newWord.trim().toLowerCase();
        if (!word) return;
        addMutation.mutate(word);
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa từ cấm này?')) {
            deleteMutation.mutate(id);
        }
    };

    const words = Array.isArray(data) ? data : data?.data || [];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Quản lý từ cấm (Banned Words)</h1>
            <p className="text-slate-500">Các từ trong danh sách này sẽ bị tự động filter hoặc warning khi user đăng bài.</p>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <form onSubmit={handleAdd} className="flex gap-4 mb-8">
                    <input 
                        type="text" 
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        placeholder="Nhập từ cấm mới..."
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                    <Button 
                        type="submit" 
                        disabled={addMutation.isPending || !newWord.trim()}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                        {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        <span>Thêm từ</span>
                    </Button>
                </form>

                {isLoading ? (
                    <div className="flex justify-center p-8 text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                ) : words.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {words.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                <span className="font-medium text-slate-700">{item.word}</span>
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deleteMutation.isPending}
                                    className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 p-8 border-2 border-dashed border-slate-200 rounded-lg">
                        Danh sách từ cấm đang trống
                    </p>
                )}
            </div>
        </div>
    );
};

export default ManageBannedWords;
