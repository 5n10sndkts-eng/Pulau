import { useKV } from '@github/spark/hooks'
import { Bell, Mail, MessageSquare, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface NotificationPreferencesScreenProps {
  onBack: () => void
}

interface NotificationSettings {
  bookingConfirmations: boolean
  tripReminders: boolean
  promotions: boolean
  messageNotifications: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

export function NotificationPreferencesScreen({ onBack }: NotificationPreferencesScreenProps) {
  const [settings, setSettings] = useKV<NotificationSettings>('notificationSettings', {
    bookingConfirmations: true,
    tripReminders: true,
    promotions: false,
    messageNotifications: true,
    emailNotifications: true,
    pushNotifications: true,
  })

  const safeSettings = settings || {
    bookingConfirmations: true,
    tripReminders: true,
    promotions: false,
    messageNotifications: true,
    emailNotifications: true,
    pushNotifications: true,
  }

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((current) => {
      const base = current || {
        bookingConfirmations: true,
        tripReminders: true,
        promotions: false,
        messageNotifications: true,
        emailNotifications: true,
        pushNotifications: true,
      }
      return {
        ...base,
        [key]: !base[key],
      }
    })
    toast.success('Notification settings updated')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="font-display text-2xl font-semibold">Notifications</h1>
        </div>
      </div>

      <div className="container max-w-2xl space-y-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Trip Notifications</CardTitle>
            <CardDescription>Get notified about your bookings and trips</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="bookingConfirmations">Booking Confirmations</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive confirmation when bookings are completed
                  </p>
                </div>
              </div>
              <Switch
                id="bookingConfirmations"
                checked={safeSettings.bookingConfirmations}
                onCheckedChange={() => handleToggle('bookingConfirmations')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="tripReminders">Trip Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders before your activities
                  </p>
                </div>
              </div>
              <Switch
                id="tripReminders"
                checked={safeSettings.tripReminders}
                onCheckedChange={() => handleToggle('tripReminders')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communication</CardTitle>
            <CardDescription>How you want to be contacted</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="messageNotifications">Message Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified of new messages from vendors
                  </p>
                </div>
              </div>
              <Switch
                id="messageNotifications"
                checked={safeSettings.messageNotifications}
                onCheckedChange={() => handleToggle('messageNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                id="emailNotifications"
                checked={safeSettings.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on this device
                  </p>
                </div>
              </div>
              <Switch
                id="pushNotifications"
                checked={safeSettings.pushNotifications}
                onCheckedChange={() => handleToggle('pushNotifications')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marketing</CardTitle>
            <CardDescription>Promotional offers and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="promotions">Promotions & Special Offers</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about deals and new experiences
                </p>
              </div>
              <Switch
                id="promotions"
                checked={safeSettings.promotions}
                onCheckedChange={() => handleToggle('promotions')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
