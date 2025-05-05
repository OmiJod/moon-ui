import { create } from 'zustand';

export type NotificationPosition = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'middle-center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type NotificationType = 'inform' | 'success' | 'error' | 'icon' | 'debug';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  position: NotificationPosition;
  icon?: string;
  duration?: number;
  debug?: {
    timestamp: number;
    data?: any;
    stack?: string;
  };
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const isDevelopment = process.env.NODE_ENV === 'development';

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2);
    
    // Add timestamp for all notifications
    const timestamp = Date.now();
    
    // Log debug info in development
    if (isDevelopment) {
      console.group(`Notification: ${notification.type}`);
      console.log('Message:', notification.message);
      console.log('Timestamp:', new Date(timestamp).toISOString());
      if (notification.debug?.data) {
        console.log('Debug Data:', notification.debug.data);
      }
      if (notification.debug?.stack) {
        console.log('Stack:', notification.debug.stack);
      }
      console.groupEnd();
    }

    set((state) => ({
      notifications: [...state.notifications, { 
        ...notification, 
        id,
        debug: notification.debug ? {
          ...notification.debug,
          timestamp
        } : undefined
      }],
    }));

    if (notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, notification.duration || 3000);
    }
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));

export const notify = {
  inform: (message: string, position: NotificationPosition = 'top-right', duration?: number) => {
    useNotificationStore.getState().addNotification({
      type: 'inform',
      message,
      position,
      duration,
    });
  },
  success: (message: string, position: NotificationPosition = 'top-right', duration?: number) => {
    useNotificationStore.getState().addNotification({
      type: 'success',
      message,
      position,
      duration,
    });
  },
  error: (message: string, position: NotificationPosition = 'top-right', duration?: number, error?: Error) => {
    useNotificationStore.getState().addNotification({
      type: 'error',
      message,
      position,
      duration,
      debug: error ? {
        timestamp: Date.now(),
        data: error.message,
        stack: error.stack
      } : undefined
    });
  },
  debug: (message: string, data?: any, position: NotificationPosition = 'top-right', duration: number = 5000) => {
    if (isDevelopment) {
      useNotificationStore.getState().addNotification({
        type: 'debug',
        message,
        position,
        duration,
        debug: {
          timestamp: Date.now(),
          data
        }
      });
    }
  },
  icon: (message: string, icon: string, position: NotificationPosition = 'top-right', duration?: number) => {
    useNotificationStore.getState().addNotification({
      type: 'icon',
      message,
      icon,
      position,
      duration,
    });
  },
};