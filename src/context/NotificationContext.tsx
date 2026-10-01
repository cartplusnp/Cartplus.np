import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppNotification, Product } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'created_at' | 'is_read'>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { info } = useToast();

  const fetchNotifications = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured) {
      setNotifications([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error.message);
        return;
      }

      if (data) {
        setNotifications(
          data.map((n) => ({
            id: n.id,
            user_id: n.user_id,
            type: n.type,
            title: n.title,
            message: n.message,
            product_id: n.product_id || undefined,
            order_id: n.order_id || undefined,
            is_read: n.is_read,
            read: n.is_read,
            created_at: n.created_at,
          }))
        );
      }
    } catch (err) {
      console.error('Notifications load exception:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    // Supabase Realtime subscription for real incoming events
    if (user?.id && isSupabaseConfigured) {
      const channel = supabase
        .channel(`public:notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as any;
            const formatted: AppNotification = {
              id: newNotif.id,
              user_id: newNotif.user_id,
              type: newNotif.type,
              title: newNotif.title,
              message: newNotif.message,
              product_id: newNotif.product_id || undefined,
              order_id: newNotif.order_id || undefined,
              is_read: newNotif.is_read,
              read: newNotif.is_read,
              created_at: newNotif.created_at,
            };
            setNotifications((prev) => [formatted, ...prev]);
            info(formatted.title);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchNotifications, info]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true, read: true } : n))
    );

    if (user?.id && isSupabaseConfigured) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read: true }))
    );

    if (user?.id && isSupabaseConfigured) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);
    }
  };

  const clearNotifications = async () => {
    setNotifications([]);
    if (user?.id && isSupabaseConfigured) {
      await supabase.from('notifications').delete().eq('user_id', user.id);
    }
  };

  const addNotification = async (
    notif: Omit<AppNotification, 'id' | 'read' | 'created_at' | 'is_read'>
  ) => {
    if (!user?.id || !isSupabaseConfigured) return;

    try {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        product_id: notif.product_id || null,
        order_id: notif.order_id || null,
        is_read: false,
      });
    } catch (err) {
      console.error('Error adding notification:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read && !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const useNotifications = useNotification;
