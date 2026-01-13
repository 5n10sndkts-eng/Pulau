/**
 * Customer Notification Bell Component
 * Story: 30.4 - Create In-App Notification Center
 *
 * Displays a notification bell icon with unread count badge,
 * dropdown showing recent notifications, and mark as read functionality.
 *
 * Based on VendorNotificationBell pattern (Story 29.5).
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, Calendar, Check, CheckCheck, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomerNotifications } from '@/hooks/useCustomerNotifications';
import {
  type CustomerNotification,
  type CustomerNotificationType,
  formatRelativeTime,
} from '@/lib/customerNotificationService';

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function NotificationIcon({ type }: { type: CustomerNotificationType }) {
  switch (type) {
    case 'booking_confirmed':
      return <Check className="h-4 w-4 text-green-600" />;
    case 'booking_cancelled':
      return <X className="h-4 w-4 text-red-600" />;
    case 'reminder_24h':
      return <Calendar className="h-4 w-4 text-blue-600" />;
    case 'reminder_2h':
      return <Clock className="h-4 w-4 text-orange-600" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

function getIconBackground(type: CustomerNotificationType): string {
  switch (type) {
    case 'booking_confirmed':
      return 'bg-green-100';
    case 'booking_cancelled':
      return 'bg-red-100';
    case 'reminder_24h':
      return 'bg-blue-100';
    case 'reminder_2h':
      return 'bg-orange-100';
    default:
      return 'bg-gray-100';
  }
}

// ============================================================================
// NOTIFICATION ITEM
// ============================================================================

interface NotificationItemProps {
  notification: CustomerNotification;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={`${notification.title}: ${notification.message}`}
      className={cn(
        'w-full flex items-start gap-3 p-3 text-left rounded-lg transition-colors',
        'hover:bg-muted/50',
        !notification.read && 'bg-primary/5',
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          getIconBackground(notification.type as CustomerNotificationType),
        )}
      >
        <NotificationIcon
          type={notification.type as CustomerNotificationType}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">
            {notification.title}
          </span>
          {!notification.read && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
    </button>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
      <p className="text-sm text-muted-foreground">No notifications yet</p>
      <p className="text-xs text-muted-foreground mt-1">
        You'll see booking updates here
      </p>
    </div>
  );
}

// ============================================================================
// LOADING STATE
// ============================================================================

function LoadingState() {
  return (
    <div className="py-8 text-center">
      <div className="h-8 w-8 mx-auto mb-2 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">Loading notifications...</p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface CustomerNotificationBellProps {
  className?: string;
}

export function CustomerNotificationBell({
  className,
}: CustomerNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useCustomerNotifications({
      enabled: true,
      showToasts: true,
    });

  const hasNotifications = notifications.length > 0;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-1">
            {hasNotifications && unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
                className="h-8 w-8"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <LoadingState />
          ) : hasNotifications ? (
            <div className="divide-y">
              {notifications.slice(0, 10).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Footer */}
        {notifications.length > 10 && (
          <div className="p-2 border-t text-center">
            <Button variant="ghost" size="sm" className="text-xs">
              View all {notifications.length} notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
