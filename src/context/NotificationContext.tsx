import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'lead';
  is_read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const addNotification = useCallback(
    (notification: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>) => {
      const newNotif: AppNotification = {
        ...notification,
        id: `notif-${Date.now()}`,
        created_at: new Date().toISOString(),
        is_read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
}
