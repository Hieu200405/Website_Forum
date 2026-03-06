import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Bell, Heart, MessageSquare, Users, CheckCheck } from 'lucide-react';
import { getNotifications, markAsRead } from '../api/notificationService';
import useAuthStore from '@/features/auth/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const SOCKET_URL = 'http://localhost:3000';

const TYPE_ICONS = {
    LIKE: <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />,
    COMMENT: <MessageSquare className="w-3.5 h-3.5 text-primary-500" />,
    FOLLOW: <Users className="w-3.5 h-3.5 text-violet-400" />,
};

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuthStore();
    const dropdownRef = useRef(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: notificationsResponse } = useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications,
        enabled: !!user,
        refetchInterval: 60000
    });

    const notifications = Array.isArray(notificationsResponse) ? notificationsResponse : notificationsResponse?.data || [];
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsReadMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
    });

    useEffect(() => {
        if (!user) return;
        const socket = io(SOCKET_URL);
        socket.on('connect', () => socket.emit('join', user.id));
        socket.on('new_notification', (notif) => {
            queryClient.setQueryData(['notifications'], (old) => {
                const arr = Array.isArray(old) ? old : old?.data || [];
                return [notif, ...arr];
            });

            // Show real-time interactive toast
            import('react-hot-toast').then(({ default: toast }) => {
                toast.custom((t) => (
                    <div
                        onClick={() => {
                            toast.dismiss(t.id);
                            if (notif.reference_id && (notif.type === 'LIKE' || notif.type === 'COMMENT')) {
                                navigate(`/user/posts/${notif.reference_id}`);
                            }
                        }}
                        className={`${
                            t.visible ? 'animate-enter' : 'animate-leave'
                        } max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer hover:bg-slate-50 transition-colors border border-primary-100 overflow-hidden`}
                    >
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <img
                                        className="h-10 w-10 rounded-full object-cover ring-2 ring-primary-100"
                                        src={notif.sender?.avatar || `https://ui-avatars.com/api/?name=${notif.sender?.username || 'U'}&background=6366f1&color=fff&bold=true`}
                                        alt=""
                                    />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-[13px] font-bold text-slate-900">
                                        {notif.sender?.username || 'Ai đó'}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                        {notif.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center p-3 text-primary-500">
                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                        </div>
                    </div>
                ), { duration: 5000 });
            });
        });
        return () => socket.disconnect();
    }, [user, queryClient, navigate]);

    useEffect(() => {
        const close = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const handleClick = (notif) => {
        if (!notif.isRead) markAsReadMutation.mutate(notif.id);
        setIsOpen(false);
        if (notif.reference_id && (notif.type === 'LIKE' || notif.type === 'COMMENT')) {
            navigate(`/user/posts/${notif.reference_id}`);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(v => !v)}
                className={`relative p-2 rounded-xl transition-all ${isOpen ? 'bg-primary-50 text-primary-600' : 'text-slate-500 hover:bg-slate-100'}`}
                title="Thông báo"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 text-[8px] text-white font-black items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100/80 overflow-hidden z-50"
                    style={{ boxShadow: '0 20px 60px -12px rgba(99,102,241,0.25)' }}>
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-primary-50/50 to-violet-50/30">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-primary-500" />
                            <h3 className="font-bold text-slate-800 text-sm">Thông báo</h3>
                            {unreadCount > 0 && (
                                <span className="text-xs bg-primary-100 text-primary-700 font-bold px-2 py-0.5 rounded-full">
                                    {unreadCount} mới
                                </span>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <button
                                onClick={() => markAsReadMutation.mutate('all')}
                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary-600 font-medium transition-colors"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Đọc tất cả
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[380px] overflow-y-auto">
                        {notifications.length > 0 ? notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => handleClick(notif)}
                                className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3 items-start ${!notif.isRead ? 'bg-primary-50/40' : ''}`}
                            >
                                {/* Avatar with type badge */}
                                <div className="relative shrink-0">
                                    <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-white shadow-sm"
                                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                        {notif.sender?.avatar ? (
                                            <img src={notif.sender.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={`https://ui-avatars.com/api/?name=${notif.sender?.username || 'U'}&background=6366f1&color=fff&bold=true`} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm">
                                        {TYPE_ICONS[notif.type] || <Bell className="w-3 h-3 text-slate-400" />}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 leading-snug">
                                        <span className="font-bold text-slate-900">{notif.sender?.username}</span>{' '}
                                        {notif.content}
                                    </p>
                                    <span className="text-xs text-slate-400 mt-1 block">
                                        {formatDistanceToNow(new Date(notif.created_at || notif.createdAt || new Date()), { addSuffix: true, locale: vi })}
                                    </span>
                                </div>

                                {!notif.isRead && (
                                    <div className="shrink-0 self-center w-2 h-2 rounded-full bg-primary-500" />
                                )}
                            </div>
                        )) : (
                            <div className="py-12 flex flex-col items-center text-center text-slate-400">
                                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                    <Bell className="w-7 h-7 text-slate-300" />
                                </div>
                                <p className="text-sm font-medium text-slate-500">Bạn chưa có thông báo nào</p>
                                <p className="text-xs text-slate-400 mt-1">Hãy đăng bài hoặc tương tác để bắt đầu!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
