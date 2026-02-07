
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, banUser } from '@/features/admin/api/adminService';
import { Search, MoreHorizontal, UserX, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ManageUsers = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: getUsers
    });

    const banMutation = useMutation({
        mutationFn: ({ userId, reason }) => banUser(userId, reason),
        onSuccess: () => {
            toast.success('Đã cập nhật trạng thái người dùng');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (err) => toast.error('Thất bại: ' + err.message)
    });

    const handleBan = (userId) => {
        if(window.confirm('Bạn có chắc muốn khóa tài khoản này?')) {
            banMutation.mutate({ userId, reason: 'Vi phạm quy định' });
        }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm user..." 
                        className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">User Info</th>
                            <th className="px-6 py-4 font-medium">Role</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Joined Date</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr><td colSpan="5" className="p-6 text-center">Loading...</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden">
                                             <img src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} alt="Avt" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{user.username}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                        user.role === 'admin' ? 'bg-red-50 text-red-700' : 
                                        user.role === 'moderator' ? 'bg-green-50 text-green-700' : 
                                        'bg-slate-100 text-slate-700'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center space-x-1.5 ${user.status === 'banned' ? 'text-red-600' : 'text-emerald-600'}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'banned' ? 'bg-red-600' : 'bg-emerald-600'}`} />
                                        <span className="font-medium capitalize">{user.status || 'Active'}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy') : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {user.status !== 'banned' ? (
                                            <button 
                                                onClick={() => handleBan(user.id)}
                                                className="p-1 text-slate-400 hover:text-red-600 transition" 
                                                title="Ban user"
                                            >
                                                <UserX className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <button className="p-1 text-slate-400 hover:text-green-600 transition" title="Unban (Todo)">
                                                <UserCheck className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;
