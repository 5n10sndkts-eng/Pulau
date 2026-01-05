# Story 13.4: Implement Notification Preferences

Status: ready-for-dev

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
**Then** toggles save immediately on change to user_notification_preferences table

### AC 4: Toggle Styling
**Given** toggles are rendered
**When** a toggle is on
**Then** toggle uses primary teal color when on

## Tasks / Subtasks

### Task 1: Create Notification Settings Screen (AC: #1, #2)
- [ ] Create screen in `app/profile/notifications.tsx`
- [ ] Query user_notification_preferences for current user
- [ ] Display toggle list with labels and descriptions
- [ ] Add section headers for grouping

### Task 2: Build Toggle Components (AC: #2, #4)
- [ ] Use React Native Switch component
- [ ] Style with teal color when active
- [ ] Add labels and helper text for each option
- [ ] Implement immediate onChange handling

### Task 3: Implement Save on Toggle (AC: #3)
- [ ] Update database on each toggle change
- [ ] No "Save" button required (immediate save)
- [ ] Show loading indicator during update
- [ ] Handle errors with toast and revert toggle

### Task 4: Set Up Notification Preferences Table
- [ ] Ensure user_notification_preferences table exists
- [ ] Columns: booking_confirmations, trip_reminders, price_drops, new_experiences, marketing
- [ ] Set defaults on user creation

## Dev Notes

### Update Preference
```typescript
const updatePreference = async (key: string, value: boolean) => {
  const { error } = await supabase
    .from('user_notification_preferences')
    .update({ [key]: value })
    .eq('user_id', user.id);

  if (error) {
    toast.error('Failed to update');
    // Revert toggle
  }
};
```

## References

- [Source: epics.md#Epic 13 - Story 13.4]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
