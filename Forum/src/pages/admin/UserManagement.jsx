import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, banUser, unbanUser } from './api/adminService';
import { Search, Ban, CheckCircle, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const UserManagement = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch Users
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, searchTerm],
    queryFn: () => getUsers({ page, limit: 10, search: searchTerm }),
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  // Ban/Unban Mutations
  const banMutation = useMutation({
    mutationFn: banUser,
    onSuccess: () => {
      toast.success('Đã khóa tài khoản thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra')
  });

  const unbanMutation = useMutation({
    mutationFn: unbanUser,
    onSuccess: () => {
      toast.success('Đã mở khóa tài khoản thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra')
  });

  const handleBan = (userId) => {
    const reason = window.prompt('Nhập lý do khóa tài khoản:');
    if (reason) {
      banMutation.mutate({ userId, reason });
    }
  };

  const handleUnban = (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn mở khóa tài khoản này?')) {
      unbanMutation.mutate(userId);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">Quản lý người dùng</h1>
             {/* Search Box */}
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm user..." 
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Joined Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                         <tr><td colSpan="6" className="text-center py-8 text-slate-500">Đang tải dữ liệu...</td></tr>
                    ) : users.length === 0 ? (
                         <tr><td colSpan="6" className="text-center py-8 text-slate-500">Không tìm thấy user nào.</td></tr>
                    ) : (
                        users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                        <span className="font-medium text-slate-900">{user.username}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 text-sm">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'moderator' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                     <span className={`flex items-center space-x-1.5 text-xs font-semibold ${user.status === 'banned' ? 'text-red-600' : 'text-green-600'}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'banned' ? 'bg-red-600' : 'bg-green-600'}`}></span>
                                        <span>{user.status === 'banned' ? 'Banned' : 'Active'}</span>
                                     </span>
                                </td>
                                <td className="px-6 py-4 text-center text-slate-500 text-sm">
                                    {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy') : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {user.status === 'banned' ? (
                                        <button 
                                            onClick={() => handleUnban(user.id)}
                                            className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Unban
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleBan(user.id)}
                                            className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Ban
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            
            {/* Simple Pagination */}
            {pagination && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        Hiển thị {users.length} trên tổng số {pagination.total} users
                    </span>
                    <div className="flex space-x-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
                        >
                            Previous
                        </button>
                        <button 
                             disabled={page >= pagination.totalPages}
                             onClick={() => setPage(page + 1)}
                             className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
       </div>
    </div>
  );
};

export default UserManagement;
