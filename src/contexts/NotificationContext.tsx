import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'placement' | 'drive' | 'application' | 'registration' | 'message' | 'system' | 'response';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  senderId?: { _id: string; name: string; email: string };
  senderRole?: string;
  relatedId?: string;
  relatedType?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  sendNotification: (data: { recipientIds: string[]; title: string; message: string; type?: string; priority?: string }) => Promise<void>;
  broadcastNotification: (data: { targetRole: string; title: string; message: string; type?: string; priority?: string }) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    // Only fetch if logged in
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.notifications.getAll();
      if (response.success) {
        setNotifications(response.notifications);
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      // Silently fail — don't redirect on notification errors
      console.error('Notification fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await api.notifications.markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await api.notifications.markAllAsRead();
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await api.notifications.delete(notificationId);
      if (response.success) {
        setNotifications(prev => {
          const deleted = prev.find(n => n._id === notificationId);
          if (deleted && !deleted.isRead) setUnreadCount(c => Math.max(0, c - 1));
          return prev.filter(n => n._id !== notificationId);
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  const sendNotification = useCallback(async (data: { recipientIds: string[]; title: string; message: string; type?: string; priority?: string }) => {
    const response = await api.notifications.send(data);
    return response;
  }, []);

  const broadcastNotification = useCallback(async (data: { targetRole: string; title: string; message: string; type?: string; priority?: string }) => {
    const response = await api.notifications.broadcast(data);
    return response;
  }, []);

  // Only start polling when logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetchNotifications();
    const interval = setInterval(() => {
      if (localStorage.getItem('token')) fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading,
      fetchNotifications, markAsRead, markAllAsRead,
      deleteNotification, sendNotification, broadcastNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
