// apps/web/components/notifications/NotificationCenter.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Settings } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    status: 'UNREAD' | 'READ';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    actionUrl?: string;
    createdAt: string;
}

interface NotificationCenterProps {
    className?: string;
}

export default function NotificationCenter({ className }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { data: session, status } = useSession();

    const user = session?.user;
    const token = (session?.user as any)?.accessToken;

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch unread count
    const fetchUnreadCount = async () => {
        if (!token) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/unread-count`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId: string) => {
        if (!token) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationId ? { ...n, status: 'READ' as const } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        if (!token) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-all-read`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => ({ ...n, status: 'READ' as const }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    useEffect(() => {
        if (user && token) {
            fetchUnreadCount();
        }
    }, [user, token]);

    useEffect(() => {
        if (isOpen && user && token) {
            fetchNotifications();
        }
    }, [isOpen, user, token]);

    // Priority colors
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT':
                return 'text-red-600 bg-red-50';
            case 'HIGH':
                return 'text-orange-600 bg-orange-50';
            case 'MEDIUM':
                return 'text-blue-600 bg-blue-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'há poucos minutos';
        } else if (diffInHours < 24) {
            return `há ${Math.floor(diffInHours)} horas`;
        } else {
            return date.toLocaleDateString('pt-BR');
        }
    };

    if (!user) return null;

    return (
        <div className={`relative ${className}`}>
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notificações"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-y-auto">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Notificações
                                </h3>
                                <div className="flex gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            Marcar todas como lidas
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-gray-500">
                                    Carregando...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>Nenhuma notificação</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${notification.status === 'UNREAD' ? 'bg-blue-50/50' : ''
                                            }`}
                                        onClick={() => {
                                            if (notification.status === 'UNREAD') {
                                                markAsRead(notification.id);
                                            }
                                            if (notification.actionUrl) {
                                                window.location.href = notification.actionUrl;
                                            }
                                        }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                                        {notification.title}
                                                    </h4>
                                                    {notification.status === 'UNREAD' && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(notification.createdAt)}
                                                    </span>
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                                                            notification.priority
                                                        )}`}
                                                    >
                                                        {notification.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    // Navigate to notifications preferences
                                    window.location.href = '/profile/notifications';
                                }}
                                className="w-full text-sm text-blue-600 hover:text-blue-800 text-center"
                            >
                                Configurar notificações
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
