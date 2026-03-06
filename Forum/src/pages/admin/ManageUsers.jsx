
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, banUser, unbanUser } from '@/features/admin/api/adminService';
import { Search, UserX, UserCheck, Loader2, Users, ShieldAlert, ShieldCheck, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ROLE_BADGE = {
    admin:     { label: 'Admin',       cls: 'bg-red-100 text-red-700 border border-red-200' },
    moderator: { label: 'Moderator',   cls: 'bg-violet-100 text-violet-700 border border-violet-200' },
    user:      { label: 'Thành viên',  cls: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

const ManageUsers = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const { data: response = {}, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: getUsers
    });

    const users = response?.data || (Array.isArray(response) ? response : []);

    const banMutation = useMutation({
        mutationFn: ({ userId, reason }) => banUser({ userId, reason }),
        onSuccess: () => { toast.success('Đã khóa tài khoản'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
        onError: err => toast.error('Lỗi: ' + err.message)
    });

    const unbanMutation = useMutation({
        mutationFn: userId => unbanUser(userId),
        onSuccess: () => { toast.success('Đã mở khóa tài khoản'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
        onError: err => toast.error('Lỗi: ' + err.message)
    });

    const filtered = users.filter(u => {
        const matchSearch = u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || u.status === filterStatus ||
                            (filterStatus === 'active' && u.status !== 'banned');
        return matchSearch && matchStatus;
    });

    const totalActive  = users.filter(u => u.status !== 'banned').length;
    const totalBanned  = users.filter(u => u.status === 'banned').length;
    const totalAdmins  = users.filter(u => u.role === 'admin' || u.role === 'moderator').length;

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-black text-slate-900">Quản lý người dùng</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{users.length} tài khoản · {totalBanned} bị khóa</p>
                </div>
            </div>

            {/* Stat chips */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 rounded-xl"><ShieldCheck className="w-4 h-4 text-emerald-600" /></div>
                    <div>
                        <div className="text-xl font-black text-slate-900">{totalActive}</div>
                        <div className="text-xs text-slate-500 font-semibold">Tài khoản hoạt động</div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-red-100 rounded-xl"><ShieldAlert className="w-4 h-4 text-red-600" /></div>
                    <div>
                        <div className="text-xl font-black text-red-600">{totalBanned}</div>
                        <div className="text-xs text-slate-500 font-semibold">Bị khóa</div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                    <div className="p-2.5 bg-violet-100 rounded-xl"><Crown className="w-4 h-4 text-violet-600" /></div>
                    <div>
                        <div className="text-xl font-black text-slate-900">{totalAdmins}</div>
                        <div className="text-xs text-slate-500 font-semibold">Admin & Moderator</div>
                    </div>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-52">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
                    {['all', 'active', 'banned'].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                filterStatus === s
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-100'
                            }`}>
                            {{ all: 'Tất cả', active: 'Hoạt động', banned: 'Bị khóa' }[s]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="px-5 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest">Người dùng</th>
                            <th className="px-5 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest">Vai trò</th>
                            <th className="px-5 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                            <th className="px-5 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest">Ngày tham gia</th>
                            <th className="px-5 py-3.5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            <tr><td colSpan="5" className="p-10 text-center">
                                <Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto" />
                            </td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="5" className="p-10 text-center text-slate-400">
                                <Users className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                                Không tìm thấy người dùng nào
                            </td></tr>
                        ) : filtered.map(user => {
                            const roleBadge = ROLE_BADGE[user.role] || ROLE_BADGE.user;
                            const isBanned = user.status === 'banned';
                            return (
                                <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 ring-1 ring-slate-200">
                                                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff&bold=true`} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{user.username}</div>
                                                <div className="text-xs text-slate-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${roleBadge.cls}`}>
                                            {roleBadge.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className={`inline-flex items-center gap-1.5 text-xs font-bold ${isBanned ? 'text-red-600' : 'text-emerald-600'}`}>
                                            <span className={`w-2 h-2 rounded-full ${isBanned ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                            {isBanned ? 'Bị khóa' : 'Hoạt động'}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                                        {user.created_at || user.createdAt ? format(new Date(user.created_at || user.createdAt), 'dd/MM/yyyy') : '—'}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        {isBanned ? (
                                            <button
                                                onClick={() => { if (window.confirm('Mở khóa tài khoản này?')) unbanMutation.mutate(user.id); }}
                                                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition ml-auto border border-emerald-200"
                                            >
                                                <UserCheck className="w-3.5 h-3.5" /> Mở khóa
                                            </button>
                                        ) : user.role !== 'admin' ? (
                                            <button
                                                onClick={() => { if (window.confirm('Khóa tài khoản này?')) banMutation.mutate({ userId: user.id, reason: 'Vi phạm quy định' }); }}
                                                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition ml-auto border border-red-200"
                                            >
                                                <UserX className="w-3.5 h-3.5" /> Khóa
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-300 mr-2">Không thể khóa</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;
