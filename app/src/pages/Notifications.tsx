import { useState, useEffect } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import apiClient from '../api/client';
import type { Notification } from '../types';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await apiClient.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiClient.markNotificationRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-kaleo-terracotta" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-kaleo-charcoal flex items-center">
            <Bell className="w-8 h-8 mr-3 text-kaleo-terracotta" />
            Notifications
          </h1>
          <p className="text-kaleo-charcoal/60 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'No new updates at the moment'}
          </p>
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-kaleo-terracotta/10">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 flex items-start space-x-4 ${
                !notification.is_read ? 'bg-kaleo-terracotta/5' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                notification.notification_type === 'success' ? 'bg-green-100' :
                notification.notification_type === 'warning' ? 'bg-yellow-100' :
                notification.notification_type === 'alert' ? 'bg-red-100' :
                'bg-blue-100'
              }`}>
                <Bell className={`w-5 h-5 ${
                  notification.notification_type === 'success' ? 'text-green-500' :
                  notification.notification_type === 'warning' ? 'text-yellow-500' :
                  notification.notification_type === 'alert' ? 'text-red-500' :
                  'text-blue-500'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-kaleo-charcoal">{notification.title}</h3>
                <p className="text-kaleo-charcoal/60 mt-1">{notification.message}</p>
                <p className="text-kaleo-charcoal/40 text-sm mt-2">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                {!notification.is_read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-2 text-kaleo-charcoal/40 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <Bell className="w-16 h-16 mx-auto mb-4 text-kaleo-charcoal/30" />
          <h3 className="font-serif text-xl text-kaleo-charcoal mb-2">No updates at the moment</h3>
          <p className="text-kaleo-charcoal/60">Your notification feed is clear for now.</p>
        </div>
      )}
    </div>
  );
}
