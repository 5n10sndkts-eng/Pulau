import { User } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserCircle,
  Calendar,
  Heart,
  CreditCard,
  Bell,
  Settings,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Building2,
} from 'lucide-react';

interface ProfileScreenProps {
  user: User;
  onLogout: () => void;
  onNavigateToSaved: () => void;
  onNavigateToTrips: () => void;
  onNavigateToVendor: () => void;
  onNavigateToSettings: () => void;
  onBack: () => void;
}

export function ProfileScreen({
  user,
  onNavigateToTrips,
  onNavigateToSaved,
  onNavigateToVendor,
  onLogout,
}: ProfileScreenProps) {
  const memberSince = new Date(2025, 0, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const menuSections = [
    {
      title: 'My Activity',
      items: [
        {
          icon: Calendar,
          label: 'My Trips',
          description: 'View bookings and travel history',
          onClick: onNavigateToTrips,
          badge: null,
          highlight: false,
        },
        {
          icon: Heart,
          label: 'Saved Experiences',
          description: 'Your wishlist',
          onClick: onNavigateToSaved,
          badge:
            (user.saved?.length ?? 0) > 0 ? (user.saved?.length ?? null) : null,
          highlight: false,
        },
      ],
    },
    {
      title: 'For Vendors',
      items: [
        {
          icon: Building2,
          label: 'Vendor Portal',
          description: 'Manage your experiences',
          onClick: onNavigateToVendor,
          badge: 'NEW',
          highlight: true,
        },
      ],
    },
    {
      title: 'Account Settings',
      items: [
        {
          icon: CreditCard,
          label: 'Payment Methods',
          description: 'Manage saved cards',
          onClick: () => alert('Payment methods coming soon'),
          badge: null,
          highlight: false,
        },
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Manage preferences',
          onClick: () => alert('Notification settings coming soon'),
          badge: null,
          highlight: false,
        },
        {
          icon: Settings,
          label: 'Preferences',
          description: `Currency: ${user.currency} • Language: ${user.language}`,
          onClick: () => alert('Preferences coming soon'),
          badge: null,
          highlight: false,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Support',
          description: 'FAQs and contact',
          onClick: () => alert('Help center coming soon'),
          badge: null,
          highlight: false,
        },
        {
          icon: Info,
          label: 'About Pulau',
          description: 'Terms, privacy, and more',
          onClick: () => alert('About page coming soon'),
          badge: null,
          highlight: false,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle className="h-16 w-16" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold">
                {user.name ||
                  (user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : 'Welcome to Pulau!')}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                Member since{' '}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : memberSince}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full sm:w-auto"
            onClick={() => alert('Edit profile coming soon')}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map((item) => (
                <Card
                  key={item.label}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    item.highlight ? 'border-2 border-primary/30' : ''
                  }`}
                  onClick={item.onClick}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.highlight ? 'bg-primary/10' : 'bg-muted'
                        }`}
                      >
                        <item.icon
                          className={`w-5 h-5 ${
                            item.highlight
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-semibold ${
                              item.highlight ? 'text-primary' : ''
                            }`}
                          >
                            {item.label}
                          </h3>
                          {item.badge && (
                            <Badge
                              variant={
                                item.badge === 'NEW' ? 'default' : 'secondary'
                              }
                              className={
                                item.badge === 'NEW'
                                  ? 'bg-primary text-white'
                                  : ''
                              }
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Log Out Button */}
        <Card
          className="p-4 cursor-pointer hover:bg-destructive/5 transition-colors border-destructive/20"
          onClick={onLogout}
        >
          <div className="flex items-center gap-3 text-destructive">
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Log Out</span>
          </div>
        </Card>

        {/* App Version */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            Pulau v1.0.0 • Made with ❤️ for travelers
          </p>
        </div>
      </div>
    </div>
  );
}
