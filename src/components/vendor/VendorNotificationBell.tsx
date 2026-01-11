/**
 * Vendor Notification Bell Component
 * Story: 29.5 - Add Real-Time Revenue Notifications
 *
 * Displays a notification bell icon with unread count badge,
 * dropdown showing recent notifications, and settings controls.
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  DollarSign,
  Settings,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/vendorAnalyticsService'
import type {
  VendorNotification,
  NotificationPermissionStatus,
  NotificationPreferences,
} from '@/lib/vendorNotificationService'

// ============================================================================
// TYPES
// ============================================================================

interface VendorNotificationBellProps {
  notifications: VendorNotification[]
  unreadCount: number
  permissionStatus: NotificationPermissionStatus
  preferences: NotificationPreferences
  onRequestPermission: () => Promise<NotificationPermissionStatus>
  onUpdatePreferences: (prefs: Partial<NotificationPreferences>) => void
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onClearAll: () => void
  onSimulateBooking?: () => void // For demo
  className?: string
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function NotificationIcon({ type }: { type: VendorNotification['type'] }) {
  switch (type) {
    case 'booking_confirmed':
      return <DollarSign className="h-4 w-4 text-green-600" />
    case 'booking_cancelled':
      return <X className="h-4 w-4 text-red-600" />
    case 'payout_sent':
      return <Check className="h-4 w-4 text-blue-600" />
    case 'review_received':
      return <Zap className="h-4 w-4 text-yellow-600" />
    default:
      return <Bell className="h-4 w-4" />
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

// ============================================================================
// NOTIFICATION ITEM
// ============================================================================

interface NotificationItemProps {
  notification: VendorNotification
  onMarkAsRead: (id: string) => void
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  return (
    <button
      onClick={() => onMarkAsRead(notification.id)}
      className={cn(
        'w-full flex items-start gap-3 p-3 text-left rounded-lg transition-colors',
        'hover:bg-muted/50',
        !notification.read && 'bg-primary/5'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          notification.type === 'booking_confirmed' && 'bg-green-100',
          notification.type === 'booking_cancelled' && 'bg-red-100',
          notification.type === 'payout_sent' && 'bg-blue-100',
          notification.type === 'review_received' && 'bg-yellow-100'
        )}
      >
        <NotificationIcon type={notification.type} />
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
        <p className="text-sm text-muted-foreground truncate">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </button>
  )
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
  )
}

// ============================================================================
// SETTINGS PANEL
// ============================================================================

interface SettingsPanelProps {
  permissionStatus: NotificationPermissionStatus
  preferences: NotificationPreferences
  onRequestPermission: () => Promise<NotificationPermissionStatus>
  onUpdatePreferences: (prefs: Partial<NotificationPreferences>) => void
  onClose: () => void
}

function SettingsPanel({
  permissionStatus,
  preferences,
  onRequestPermission,
  onUpdatePreferences,
  onClose,
}: SettingsPanelProps) {
  const [isRequesting, setIsRequesting] = useState(false)

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    await onRequestPermission()
    setIsRequesting(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Notification Settings</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Toast Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Toast Notifications</p>
          <p className="text-xs text-muted-foreground">
            Show in-app popup alerts
          </p>
        </div>
        <Switch
          checked={preferences.toastNotificationsEnabled}
          onCheckedChange={(checked) =>
            onUpdatePreferences({ toastNotificationsEnabled: checked })
          }
        />
      </div>

      {/* Browser Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Browser Notifications</p>
          <p className="text-xs text-muted-foreground">
            {permissionStatus === 'granted'
              ? 'Receive desktop alerts'
              : permissionStatus === 'denied'
              ? 'Blocked by browser'
              : permissionStatus === 'unsupported'
              ? 'Not supported'
              : 'Enable desktop alerts'}
          </p>
        </div>
        {permissionStatus === 'granted' ? (
          <Switch
            checked={preferences.browserNotificationsEnabled}
            onCheckedChange={(checked) =>
              onUpdatePreferences({ browserNotificationsEnabled: checked })
            }
          />
        ) : permissionStatus === 'default' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRequestPermission}
            disabled={isRequesting}
          >
            {isRequesting ? 'Requesting...' : 'Enable'}
          </Button>
        ) : (
          <BellOff className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function VendorNotificationBell({
  notifications,
  unreadCount,
  permissionStatus,
  preferences,
  onRequestPermission,
  onUpdatePreferences,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSimulateBooking,
  className,
}: VendorNotificationBellProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const hasNotifications = notifications.length > 0

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

      <PopoverContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        {showSettings ? (
          <div className="p-4">
            <SettingsPanel
              permissionStatus={permissionStatus}
              preferences={preferences}
              onRequestPermission={onRequestPermission}
              onUpdatePreferences={onUpdatePreferences}
              onClose={() => setShowSettings(false)}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-1">
                {onSimulateBooking && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSimulateBooking}
                    title="Simulate booking (demo)"
                    className="h-8 w-8"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                )}
                {hasNotifications && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onMarkAllAsRead}
                      title="Mark all as read"
                      className="h-8 w-8"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClearAll}
                      title="Clear all"
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  title="Settings"
                  className="h-8 w-8"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto">
              {hasNotifications ? (
                <div className="divide-y">
                  {notifications.slice(0, 10).map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
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
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
