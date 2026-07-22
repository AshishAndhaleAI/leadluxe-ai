import { useNotifications } from '../../context/NotificationContext';
import { Bell } from 'lucide-react';

export function NotificationBadge() {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-luxury-gold-500 rounded-full text-[10px] font-bold text-black flex items-center justify-center">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
}
