# Story 13.4: Implement Notification Preferences

Status: done

## Story

As a user,
I want to control what notifications I receive,
So that I only get relevant alerts.

## Acceptance Criteria

### AC 1: Notification Settings Screen
**Given** I tap "Notifications" from profile
**When** the notifications settings screen loads
**Then** I see toggle switches for notification types

### AC 2: Toggle Options Display
**Given** notification toggles are displayed
**When** I view the list
**Then** I see toggles for:
- Booking Confirmations (default: on)
- Trip Reminders (default: on)
- Price Drops on Saved (default: on)
- New Experiences (default: off)
- Marketing & Promotions (default: off)

### AC 3: Immediate Save
**Given** I toggle a setting
**When** the toggle changes
**Then** toggles save immediately on change to KV store with key `user:notifications:preferences:{userId}`

### AC 4: Toggle Styling
**Given** toggles are rendered
**When** a toggle is on
**Then** toggle uses primary teal color when on

## Tasks / Subtasks

### Task 1: Create Notification Settings Component (AC: #1, #2)
- [x] Create component in `src/pages/NotificationSettings.tsx`
- [x] Query KV store with key `user:notifications:preferences:{userId}` for current user preferences
- [x] Display toggle list with labels and descriptions using Tailwind styling
- [x] Add section headers for grouping notification types
- [x] Set up React Router route for `/profile/notifications`

### Task 2: Build Toggle Components (AC: #2, #4)
- [x] Use Radix UI Switch component (`@radix-ui/react-switch`)
- [x] Style with teal color (Tailwind `bg-teal-600`) when active
- [x] Add labels and helper text for each option using semantic HTML
- [x] Implement immediate onChange handling with optimistic updates
- [x] Add smooth toggle animations using Tailwind transitions

### Task 3: Implement Save on Toggle (AC: #3)
- [x] Update KV store on each toggle change
- [x] No "Save" button required (immediate save)
- [x] Show subtle loading indicator during update
- [x] Handle errors with Radix UI Toast and revert toggle state
- [x] Use optimistic updates for instant UI feedback

### Task 4: Set Up Notification Preferences Data Model
- [x] Define TypeScript interface for `NotificationPreferences`
- [x] Set default values when no preferences exist in KV store
- [x] Initialize preferences on first user profile creation
- [x] Ensure proper typing for all preference fields

## Dev Notes

### TypeScript Interface
```typescript
interface NotificationPreferences {
  userId: string;
  bookingConfirmations: boolean;
  tripReminders: boolean;
  priceDrops: boolean;
  newExperiences: boolean;
  marketing: boolean;
  updatedAt: string;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  userId: '',
  bookingConfirmations: true,
  tripReminders: true,
  priceDrops: true,
  newExperiences: false,
  marketing: false,
  updatedAt: new Date().toISOString(),
};
```

### Notification Settings Component
```typescript
import { useState } from 'react';
import { useKV } from '@/hooks/useKV';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Switch from '@radix-ui/react-switch';
import { toast } from '@/components/ui/toast';
import { Bell, DollarSign, Sparkles, Mail } from 'lucide-react';

const NotificationSettings = () => {
  const kv = useKV();
  const queryClient = useQueryClient();
  const userId = getCurrentUserId(); // From auth context

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences', userId],
    queryFn: async () => {
      const stored = await kv.get<NotificationPreferences>(
        `user:notifications:preferences:${userId}`
      );
      return stored || { ...DEFAULT_PREFERENCES, userId };
    },
  });

  const updatePreference = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean }) => {
      const updated = { ...preferences, [key]: value, updatedAt: new Date().toISOString() };
      await kv.set(`user:notifications:preferences:${userId}`, updated);
      return updated;
    },
    onMutate: async ({ key, value }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['notification-preferences', userId] });
      const previous = queryClient.getQueryData(['notification-preferences', userId]);
      queryClient.setQueryData(['notification-preferences', userId], (old: any) => ({
        ...old,
        [key]: value,
      }));
      return { previous };
    },
    onError: (error, variables, context) => {
      // Revert on error
      queryClient.setQueryData(['notification-preferences', userId], context?.previous);
      toast({
        title: 'Failed to update preference',
        description: 'Please try again',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', userId] });
    },
  });

  const handleToggle = (key: string, value: boolean) => {
    updatePreference.mutate({ key, value });
  };

  if (isLoading) {
    return <div className="p-6">Loading preferences...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Notification Preferences</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Choose what notifications you want to receive
      </p>

      <div className="space-y-6">
        {/* Essential Notifications */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Essential</h2>
          <div className="space-y-4">
            <NotificationToggle
              icon={<Bell className="text-teal-600" />}
              label="Booking Confirmations"
              description="Get notified when your booking is confirmed"
              checked={preferences.bookingConfirmations}
              onCheckedChange={(checked) => handleToggle('bookingConfirmations', checked)}
            />
            <NotificationToggle
              icon={<Bell className="text-teal-600" />}
              label="Trip Reminders"
              description="Receive reminders about upcoming trips"
              checked={preferences.tripReminders}
              onCheckedChange={(checked) => handleToggle('tripReminders', checked)}
            />
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
          <div className="space-y-4">
            <NotificationToggle
              icon={<DollarSign className="text-teal-600" />}
              label="Price Drops on Saved"
              description="Get alerts when saved experiences go on sale"
              checked={preferences.priceDrops}
              onCheckedChange={(checked) => handleToggle('priceDrops', checked)}
            />
            <NotificationToggle
              icon={<Sparkles className="text-teal-600" />}
              label="New Experiences"
              description="Discover newly added experiences"
              checked={preferences.newExperiences}
              onCheckedChange={(checked) => handleToggle('newExperiences', checked)}
            />
          </div>
        </section>

        {/* Marketing */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Marketing</h2>
          <div className="space-y-4">
            <NotificationToggle
              icon={<Mail className="text-teal-600" />}
              label="Marketing & Promotions"
              description="Special offers and promotional content"
              checked={preferences.marketing}
              onCheckedChange={(checked) => handleToggle('marketing', checked)}
            />
          </div>
        </section>
      </div>
    </div>
  );
};
```

### Notification Toggle Component
```typescript
import * as Switch from '@radix-ui/react-switch';

interface NotificationToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const NotificationToggle = ({ 
  icon, 
  label, 
  description, 
  checked, 
  onCheckedChange 
}: NotificationToggleProps) => {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="mt-1">{icon}</div>
      
      <div className="flex-1">
        <label 
          htmlFor={label}
          className="block font-medium text-gray-900 dark:text-white mb-1 cursor-pointer"
        >
          {label}
        </label>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      <Switch.Root
        id={label}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative transition-colors data-[state=checked]:bg-teal-600"
        aria-label={label}
      >
        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
      </Switch.Root>
    </div>
  );
};
```

### KV Store Key Pattern
```typescript
// Key pattern for notification preferences
const NOTIFICATION_PREFS_KEY = (userId: string) => 
  `user:notifications:preferences:${userId}`;

// Example usage
await kv.set(NOTIFICATION_PREFS_KEY(userId), preferences);
const prefs = await kv.get<NotificationPreferences>(NOTIFICATION_PREFS_KEY(userId));
```

### Testing Considerations
- Test toggling each preference type
- Verify optimistic updates work correctly
- Test error handling with network failures
- Verify preferences persist across sessions
- Test with default values for new users
- Verify toggle animations are smooth
- Test accessibility (keyboard navigation, screen readers)
- Verify dark mode styling
- Test that changes are immediately reflected in other parts of app
- Validate ARIA labels for all toggles

## References

- [Source: planning-artifacts/epics/epic-13.md#Epic 13 - Story 13.4]
- [Related: Story 13.1 - Build Profile Screen Layout]
- [Architecture: ADR-002 - KV Store Data Layer]
- [UI Component: Radix UI Switch](https://www.radix-ui.com/docs/primitives/components/switch)

---

## Template Fix Notes (2026-01-06)

**Issues Fixed:**
1. ✅ File paths: `app/profile/notifications.tsx` → `src/pages/NotificationSettings.tsx`
2. ✅ Components: React Native Switch → Radix UI Switch component
3. ✅ Data layer: Supabase KV namespace (`user_notification_preferences`) → KV store with key pattern
4. ✅ Database updates: `supabase.from().update()` → `kv.set()`
5. ✅ Styling: React Native styles → Tailwind CSS with dark mode
6. ✅ Icons: Added Lucide React icons (Bell, DollarSign, Sparkles, Mail)
7. ✅ Added TypeScript interfaces for type safety
8. ✅ Added optimistic updates for instant UI feedback
9. ✅ Added error handling with Radix UI Toast
10. ✅ Added accessibility features (ARIA labels, keyboard navigation)
11. ✅ Added dark mode support throughout
12. ✅ Added proper component structure with reusable NotificationToggle component

**Root Cause:** Story was templated from React Native/Supabase project but implemented as React Web with GitHub Spark KV store.

**Verification:** Story now accurately reflects React Web architecture as documented in `_bmad-output/planning-artifacts/prd/pulau-prd.md` Technical Architecture section and ADR documents.

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

