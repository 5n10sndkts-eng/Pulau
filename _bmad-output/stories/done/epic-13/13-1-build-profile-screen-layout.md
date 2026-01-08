# Story 13.1: Build Profile Screen Layout

Status: ready-for-dev

## Story

As a logged-in user,
I want to view and access my profile settings,
So that I can manage my account.

## Acceptance Criteria

### AC 1: Profile Screen Access
**Given** I tap "Profile" in bottom navigation (User icon)
**When** the Profile screen loads
**Then** I see my profile and settings interface

### AC 2: Profile Header Display
**Given** the Profile screen has loaded
**When** I view the header
**Then** I see profile header containing:
- Profile photo (circular, 80px, or placeholder avatar)
- Full name
- "Member since [month year]"
- "Edit Profile" button

### AC 3: Menu Sections Display
**Given** the Profile screen displays menu options
**When** I scroll through the screen
**Then** I see menu sections below header:
- My Trips (arobject to booking history)
- Saved Experiences (arobject to wishlist)
- Payment Methods
- Notifications
- Preferences (currency, language)
- Help & Support
- About Pulau
- Log Out

### AC 4: Menu Item Styling
**Given** menu items are displayed
**When** I view each item
**Then** each menu item has icon, label, and chevron
**And** items are properly spaced and styled

## Tasks / Subtasks

### Task 1: Create ProfileScreen Component (AC: #1)
- [ ] Create `ProfilePage` component in `src/pages/Profile.tsx`
- [ ] Add route for `/profile` in React Router configuration
- [ ] Add User icon from Lucide React to navigation menu
- [ ] Set page title to "Profile" using document.title
- [ ] Use main container with vertical scrolling (overflow-y-auto)

### Task 2: Build Profile Header (AC: #2)
- [ ] Create `ProfileHeader` component in `src/components/profile/ProfileHeader.tsx`
- [ ] Display circular profile photo (80px): `w-20 h-20 rounded-full`
- [ ] Show placeholder avatar using Lucide React User icon if no photo
- [ ] Show user's full name from KV store or useUser hook
- [ ] Calculate and display "Member since [month year]" using date-fns
- [ ] Add "Edit Profile" button with React Router Link to `/profile/edit`
- [ ] Style header with Tailwind: `flex items-center gap-4 p-6 bg-white dark:bg-gray-800`

### Task 3: Fetch User Profile Data (AC: #2)
- [ ] Create `useUserProfile` hook in `src/hooks/useUserProfile.ts`
- [ ] Use `useUser()` hook from GitHub Spark SDK to get current user
- [ ] Query KV store for user profile data using key pattern: `user_profile:{userId}`
- [ ] Fetch: firstName, lastName, profilePhotoUrl, createdAt
- [ ] Handle loading state during fetch with skeleton loader
- [ ] Handle error state with toast notification (Sonner)
- [ ] Cache profile data with React Query (staleTime: 5 minutes)

### Task 4: Create Menu Item Component (AC: #4)
- [ ] Create `ProfileMenuItem` component in `src/components/profile/ProfileMenuItem.tsx`
- [ ] Props: icon (LucideIcon type), label, href (React Router), onClick
- [ ] Display Lucide React icon on left with `w-5 h-5 text-gray-500`
- [ ] Show label text with `text-gray-900 dark:text-white`
- [ ] Add ChevronRight icon on right
- [ ] Make item clickable with Link or button
- [ ] Style with Tailwind: `flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition`
- [ ] Add border between items: `border-b border-gray-200 dark:border-gray-700`

### Task 5: Build Menu Sections (AC: #3)
- [ ] Create "My Trips" menu item linking to `/bookings`
- [ ] Create "Saved Experiences" item linking to `/wishlist`
- [ ] Create "Payment Methods" item linking to `/profile/payments`
- [ ] Create "Notifications" item linking to `/profile/notifications`
- [ ] Create "Preferences" item linking to `/profile/preferences`
- [ ] Create "Help & Support" item linking to `/support`
- [ ] Create "About Pulau" item linking to `/about`
- [ ] Create "Log Out" item with onClick handler (no href)
- [ ] Group related items with section dividers or spacing

### Task 6: Implement Navigation (AC: #3)
- [ ] Use React Router Link for menu item navigation
- [ ] Use useNavigate hook for programmatic navigation
- [ ] Track analytics for menu item clicks using analytics service
- [ ] Ensure back button works correctly with bobjectser history
- [ ] Add page transitions using React Router transitions (optional)

### Task 7: Implement Logout Functionality (AC: #3)
- [ ] Create logout confirmation dialog using Radix UI AlertDialog
- [ ] Call GitHub Spark auth logout on confirmation
- [ ] Clear React Query cache on logout
- [ ] Clear localStorage items (preferences, cached data)
- [ ] Navigate to `/login` or home page using React Router
- [ ] Handle logout errors with toast notification
- [ ] Show loading spinner on logout button during process
- [ ] Use Sonner toast: "Logged out successfully"

## Dev Notes

### User Profile Hook
```typescript
// src/hooks/useUserProfile.ts
import { useUser, useKV } from '@github-spark/app';
import { useQuery } from '@tanstack/react-query';

interface UserProfile {
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  createdAt: string;
}

export function useUserProfile() {
  const user = useUser();
  const kv = useKV();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) thobject new Error('Not authenticated');
      
      const profile = await kv.get<UserProfile>(`user_profile:${user.id}`);
      return profile ?? {
        firstName: user.displayName?.split(' ')[0] || 'User',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        createdAt: new Date().toISOString(),
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

### Member Since Calculation
```typescript
// src/lib/date-utils.ts
import { format } from 'date-fns';

export function getMemberSince(createdAt: string): string {
  const date = new Date(createdAt);
  return format(date, 'MMMM yyyy'); // "January 2024"
}
```

### Menu Items Configuration
```typescript
// src/components/profile/ProfileMenu.tsx
import { 
  Calendar, Heart, CreditCard, Bell, Settings, 
  HelpCircle, Info, LogOut, type LucideIcon 
} from 'lucide-react';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  action?: 'logout';
  variant?: 'default' | 'destructive';
}

const menuItems: MenuItem[] = [
  { icon: Calendar, label: 'My Trips', href: '/bookings' },
  { icon: Heart, label: 'Saved Experiences', href: '/wishlist' },
  { icon: CreditCard, label: 'Payment Methods', href: '/profile/payments' },
  { icon: Bell, label: 'Notifications', href: '/profile/notifications' },
  { icon: Settings, label: 'Preferences', href: '/profile/preferences' },
  { icon: HelpCircle, label: 'Help & Support', href: '/support' },
  { icon: Info, label: 'About Pulau', href: '/about' },
  { icon: LogOut, label: 'Log Out', action: 'logout', variant: 'destructive' },
];
```

### Profile Menu Item Component
```typescript
// src/components/profile/ProfileMenuItem.tsx
import { Link } from 'react-router-dom';
import { ChevronRight, type LucideIcon } from 'lucide-react';

interface ProfileMenuItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
}

export function ProfileMenuItem({ 
  icon: Icon, 
  label, 
  href, 
  onClick,
  variant = 'default'
}: ProfileMenuItemProps) {
  const className = `
    flex items-center justify-between p-4 
    border-b border-gray-200 dark:border-gray-700
    hover:bg-gray-50 dark:hover:bg-gray-700 
    transition cursor-pointer
    ${variant === 'destructive' ? 'text-red-600 dark:text-red-400' : ''}
  `.trim();

  const content = (
    <>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-900 dark:text-white font-medium">
          {label}
        </span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </>
  );

  if (href) {
    return <Link to={href} className={className}>{content}</Link>;
  }

  return (
    <button onClick={onClick} className={`${className} w-full text-left`}>
      {content}
    </button>
  );
}
```

### Logout Confirmation Dialog
```typescript
// src/components/profile/LogoutDialog.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // Clear authentication (GitHub Spark SDK)
      // await auth.signOut(); // Implement based on actual SDK
      
      // Clear React Query cache
      queryClient.clear();
      
      // Clear localStorage
      localStorage.removeItem('user_preferences');
      localStorage.removeItem('cached_data');
      
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setIsLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Log Out</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to log out? You'll need to sign in again to access your bookings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLogout}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Logging out...' : 'Log Out'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Profile Page Structure
```typescript
// src/pages/Profile.tsx
import { useState } from 'react';
import { User } from 'lucide-react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileMenuItem } from '@/components/profile/ProfileMenuItem';
import { LogoutDialog } from '@/components/profile/LogoutDialog';
import { useUserProfile } from '@/hooks/useUserProfile';
import { menuItems } from '@/components/profile/ProfileMenu';

export function ProfilePage() {
  const { data: profile, isLoading } = useUserProfile();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ProfileHeader profile={profile} />
      
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        {menuItems.map((item) => (
          <ProfileMenuItem
            key={item.label}
            {...item}
            onClick={item.action === 'logout' ? () => setLogoutDialogOpen(true) : undefined}
          />
        ))}
      </div>

      <LogoutDialog 
        open={logoutDialogOpen} 
        onOpenChange={setLogoutDialogOpen} 
      />
    </div>
  );
}
```

### Testing Considerations
- Test with users who have profile photos and without (placeholder avatar)
- Verify "Member since" calculation for various join dates
- Test all menu item navigation using React Router
- Verify logout flow completely (dialog → auth clear → redirect)
- Test with slow network (loading states, skeleton)
- Ensure keyboard navigation works for menu items
- Validate accessibility with screen readers
- Test dark mode styling for all components

## References

- [Source: planning-artifacts/epics/epic-13.md#Epic 13 - Story 13.1]
- [Source: planning-artifacts/prd/pulau-prd.md#Profile & Settings]
- [Related: Story 13.2 - Create Edit Profile Screen]
- [Related: Story 11.1 - Create Booking History Screen]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

---

## Template Fix Notes (2026-01-06)

**Issues Fixed:**
1. ✅ File paths (app/(tabs)/profile → src/pages/Profile.tsx)
2. ✅ Supabase auth → GitHub Spark SDK auth
3. ✅ Database queries → KV store with useKV hook
4. ✅ Alert.alert → Radix UI AlertDialog
5. ✅ Navigation (router.push → React Router Link/useNavigate)
6. ✅ Icon system (expo-vector-icons → Lucide React)
7. ✅ Styling (inline styles → Tailwind CSS)
8. ✅ Tab navigation → Route-based navigation
9. ✅ Added TypeScript interfaces
10. ✅ Added date-fns for date formatting
11. ✅ Added Sonner for toast notifications
12. ✅ Added Radix UI for accessible dialogs
13. ✅ Updated PRD reference path
14. ✅ Added dark mode support throughout

**Root Cause:** Story was templated from React Native/Supabase project but implemented as React Web with GitHub Spark KV store.

**Verification:** Story now accurately reflects React Web architecture as documented in `_bmad-output/planning-artifacts/prd/pulau-prd.md`.
