
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/features/categories/api/categoryService';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageCategories = () => {
    const [isEditing, setIsEditing] = useState(null); // id of category being edited
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    
    // New category state
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const queryClient = useQueryClient();

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories
    });

    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            toast.success('Tạo danh mục thành công');
            setIsCreating(false);
            setNewName('');
            setNewDesc('');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi tạo danh mục')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateCategory(id, data),
        onSuccess: () => {
            toast.success('Cập nhật thành công');
            setIsEditing(null);
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi cập nhật')
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            toast.success('Xóa danh mục thành công');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi xóa')
    });

    const handleEditClick = (cat) => {
        setIsEditing(cat.id);
        setEditName(cat.name);
        setEditDesc(cat.description || '');
    };

    const handleSaveEdit = (id) => {
        if (!editName.trim()) return toast.error('Tên không được để trống');
        updateMutation.mutate({ id, data: { name: editName, description: editDesc } });
    };

    const handleCreate = () => {
        if (!newName.trim()) return toast.error('Tên không được để trống');
        createMutation.mutate({ name: newName, description: newDesc });
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa danh mục này? Hành động này không thể hoàn tác.')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quản lý Danh mục</h1>
                    <p className="text-slate-500 mt-1">Quản lý các danh mục bài viết trên hệ thống</p>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Thêm danh mục</span>
                </button>
            </div>

            {/* Create Form */}
            {isCreating && (
                <div className="bg-white p-6 rounded-xl border border-primary-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-slate-900 mb-4">Thêm danh mục mới</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tên danh mục</label>
                            <input 
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Nhập tên..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                            <input 
                                type="text"
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Nhập mô tả..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button 
                            onClick={() => setIsCreating(false)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={handleCreate}
                            disabled={createMutation.isPending}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2 disabled:opacity-70"
                        >
                            {createMutation.isPending ? 'Đang tạo...' : 'Lưu danh mục'}
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Tên danh mục</th>
                            <th className="px-6 py-4">Mô tả</th>
                            <th className="px-6 py-4 text-center">Slug</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                             <tr><td colSpan="4" className="text-center py-8 text-slate-500">Đang tải...</td></tr>
                        ) : categories.length === 0 ? (
                             <tr><td colSpan="4" className="text-center py-8 text-slate-500">Chưa có danh mục nào.</td></tr>
                        ) : (
                            categories.map(cat => (
                                <tr key={cat.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        {isEditing === cat.id ? (
                                            <input 
                                                autoFocus
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="px-2 py-1 border border-primary-300 rounded focus:ring-1 focus:ring-primary-500 w-full"
                                            />
                                        ) : (
                                            <span className="font-medium text-slate-900">{cat.name}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">
                                        {isEditing === cat.id ? (
                                            <input 
                                                value={editDesc}
                                                onChange={(e) => setEditDesc(e.target.value)}
                                                className="px-2 py-1 border border-primary-300 rounded focus:ring-1 focus:ring-primary-500 w-full"
                                            />
                                        ) : (
                                            cat.description || '-'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center text-xs font-mono text-slate-500">
                                        {cat.slug}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            {isEditing === cat.id ? (
                                                <>
                                                    <button onClick={() => handleSaveEdit(cat.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setIsEditing(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEditClick(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageCategories;
