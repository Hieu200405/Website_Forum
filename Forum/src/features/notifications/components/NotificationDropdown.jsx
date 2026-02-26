import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Bell } from 'lucide-react';
import { getNotifications, markAsRead } from '../api/notificationService';
import useAuthStore from '@/features/auth/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const SOCKET_URL = 'http://localhost:3000';

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
        refetchInterval: 60000 // Refetch every minute as backup
    });

    const notifications = notificationsResponse?.data || [];
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsReadMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    useEffect(() => {
        if (!user) return;

        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            socket.emit('join', user.id);
        });

        socket.on('new_notification', (notification) => {
            // Update react query cache manually
            queryClient.setQueryData(['notifications'], (oldData) => {
                if (!oldData) return { data: [notification] };
                return {
                    ...oldData,
                    data: [notification, ...oldData.data]
                };
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [user, queryClient]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsReadMutation.mutate(notification.id);
        }
        
        setIsOpen(false);
        
        // Navigate based on referenceId
        if (notification.reference_id && (notification.type === 'LIKE' || notification.type === 'COMMENT')) {
            navigate(`/user/posts/${notification.reference_id}`);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                title="Thông báo"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Thông báo</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs bg-primary-100 text-primary-700 font-bold px-2 py-0.5 rounded-full">
                                {unreadCount} mới
                            </span>
                        )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div 
                                    key={notif.id} 
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3 ${!notif.isRead ? 'bg-primary-50/30' : ''}`}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-primary-500 flex items-center justify-center text-white font-bold">
                                            {notif.sender?.username?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 leading-snug">
                                            <span className="font-bold text-slate-900">{notif.sender?.username}</span> {notif.content}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1.5">
                                            <span className="text-xs font-medium text-slate-400">
                                                {formatDistanceToNow(new Date(notif.created_at || notif.createdAt || new Date()), { addSuffix: true, locale: vi })}
                                            </span>
                                        </div>
                                    </div>
                                    {!notif.isRead && (
                                        <div className="flex-shrink-0 self-center">
                                            <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                                <Bell className="w-12 h-12 text-slate-200 mb-3" />
                                <p className="text-sm">Bạn chưa có thông báo nào!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
