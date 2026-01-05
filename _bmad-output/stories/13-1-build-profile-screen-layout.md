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
- My Trips (arrow to booking history)
- Saved Experiences (arrow to wishlist)
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
- [ ] Create ProfileScreen in `app/(tabs)/profile/index.tsx`
- [ ] Add User icon to bottom tab navigation
- [ ] Set screen title to "Profile"
- [ ] Configure as a tab in bottom navigation
- [ ] Add ScrollView for content

### Task 2: Build Profile Header (AC: #2)
- [ ] Create ProfileHeader component
- [ ] Display circular profile photo (80px) or placeholder avatar
- [ ] Show user's full name from user_profiles
- [ ] Calculate and display "Member since [month year]" from created_at
- [ ] Add "Edit Profile" button navigating to edit screen
- [ ] Style header with proper spacing and alignment

### Task 3: Fetch User Profile Data (AC: #2)
- [ ] Create useUserProfile hook
- [ ] Query user_profiles table for current user
- [ ] Fetch: first_name, last_name, profile_photo_url, created_at
- [ ] Handle loading state during fetch
- [ ] Handle error state if fetch fails
- [ ] Cache profile data with React Query

### Task 4: Create Menu Item Component (AC: #4)
- [ ] Create ProfileMenuItem component
- [ ] Props: icon, label, onPress, showChevron
- [ ] Display icon on left (from expo-vector-icons or Lucide)
- [ ] Show label text
- [ ] Add chevron arrow on right
- [ ] Make item pressable with feedback
- [ ] Style with proper padding and borders

### Task 5: Build Menu Sections (AC: #3)
- [ ] Create My Trips menu item linking to booking history
- [ ] Create Saved Experiences item linking to wishlist
- [ ] Create Payment Methods item linking to payment screen
- [ ] Create Notifications item linking to preferences
- [ ] Create Preferences item linking to settings
- [ ] Create Help & Support item linking to help screen
- [ ] Create About Pulau item linking to about screen
- [ ] Create Log Out item with logout confirmation

### Task 6: Implement Navigation (AC: #3)
- [ ] Configure navigation for each menu item
- [ ] Use router.push for screen navigation
- [ ] Pass necessary params to target screens
- [ ] Track analytics for menu item taps
- [ ] Ensure back navigation works correctly

### Task 7: Implement Logout Functionality (AC: #3)
- [ ] Add logout confirmation modal
- [ ] Call Supabase auth.signOut() on confirmation
- [ ] Clear local storage/cache on logout
- [ ] Navigate to login/onboarding screen
- [ ] Handle logout errors gracefully
- [ ] Show loading indicator during logout

## Dev Notes

### User Profile Query
```typescript
const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};
```

### Member Since Calculation
```typescript
const getMemberSince = (createdAt: string) => {
  const date = new Date(createdAt);
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${month} ${year}`;
};
```

### Menu Items Configuration
```typescript
const menuItems = [
  { icon: 'calendar', label: 'My Trips', route: '/profile/my-trips' },
  { icon: 'heart', label: 'Saved Experiences', route: '/profile/wishlist' },
  { icon: 'credit-card', label: 'Payment Methods', route: '/profile/payments' },
  { icon: 'bell', label: 'Notifications', route: '/profile/notifications' },
  { icon: 'settings', label: 'Preferences', route: '/profile/preferences' },
  { icon: 'help-circle', label: 'Help & Support', route: '/profile/help' },
  { icon: 'info', label: 'About Pulau', route: '/profile/about' },
  { icon: 'log-out', label: 'Log Out', action: 'logout' },
];
```

### Logout Confirmation
```typescript
const handleLogout = () => {
  Alert.alert(
    'Log Out',
    'Are you sure you want to log out?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        },
      },
    ]
  );
};
```

### Component Structure
```
ProfileScreen
├── ProfileHeader
│   ├── ProfilePhoto
│   ├── UserName
│   ├── MemberSince
│   └── EditProfileButton
└── MenuSection
    ├── ProfileMenuItem (My Trips)
    ├── ProfileMenuItem (Saved)
    ├── ProfileMenuItem (Payments)
    ├── ProfileMenuItem (Notifications)
    ├── ProfileMenuItem (Preferences)
    ├── ProfileMenuItem (Help)
    ├── ProfileMenuItem (About)
    └── ProfileMenuItem (Logout)
```

### Testing Considerations
- Test with users who have profile photos and without
- Verify "Member since" calculation for various join dates
- Test all menu item navigation
- Verify logout flow completely
- Test with slow network (loading states)
- Ensure accessibility for menu items

## References

- [Source: epics.md#Epic 13 - Story 13.1]
- [Source: prd/pulau-prd.md#Profile & Settings]
- [Related: Story 13.2 - Create Edit Profile Screen]
- [Related: Story 11.1 - Create Booking History Screen]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
