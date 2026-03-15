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
  senderId?: {
    _id: string;
    name: string;
    email: string;
  };
  senderRole?: string;
  relatedId?: string;
  relatedType?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  sendNotification: (data: {
    recipientIds: string[];
    title: string;
    message: string;
    type?: string;
    priority?: string;
  }) => Promise<void>;
  broadcastNotification: (data: {
    targetRole: string;
    title: string;
    message: string;
    type?: string;
    priority?: string;
  }) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      console.log('NotificationContext: Fetching notifications...');
      const response = await api.notifications.getAll();
      console.log('NotificationContext: Response received:', response);
      if (response.success) {
        console.log('NotificationContext: Setting notifications:', response.notifications.length);
        setNotifications(response.notifications);
        setUnreadCount(response.unreadCount);
      } else {
        console.warn('NotificationContext: Response not successful:', response);
      }
    } catch (error) {
      console.error('NotificationContext: Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await api.notifications.markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
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
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await api.notifications.delete(notificationId);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        const deletedNotification = notifications.find(n => n._id === notificationId);
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  const sendNotification = useCallback(async (data: {
    recipientIds: string[];
    title: string;
    message: string;
    type?: string;
    priority?: string;
  }) => {
    try {
      const response = await api.notifications.send(data);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }, []);

  const broadcastNotification = useCallback(async (data: {
    targetRole: string;
    title: string;
    message: string;
    type?: string;
    priority?: string;
  }) => {
    try {
      console.log('Broadcasting notification:', data);
      const response = await api.notifications.broadcast(data);
      console.log('Broadcast response:', response);
      return response;
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      throw error;
    }
  }, []);

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        sendNotification,
        broadcastNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
