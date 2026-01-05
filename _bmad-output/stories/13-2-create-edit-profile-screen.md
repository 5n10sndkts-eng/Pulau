# Story 13.2: Create Edit Profile Screen

Status: ready-for-dev

## Story

As a user,
I want to edit my profile information,
So that my account details are current.

## Acceptance Criteria

### AC 1: Navigation to Edit Screen
**Given** I tap "Edit Profile" from profile screen
**When** the edit profile screen loads
**Then** I see the profile editing form

### AC 2: Form Fields Display
**Given** the edit profile screen has loaded
**When** I view the form
**Then** I see form with current values:
- Profile photo with "Change Photo" overlay
- First Name input
- Last Name input
- Phone Number input
- Email (read-only, displays "Contact support to change")

### AC 3: Photo Selection Options
**Given** I tap profile photo
**When** the photo options appear
**Then** options appear: "Take Photo", "Choose from Library", "Remove Photo"
**And** I can select any option to update my photo

### AC 4: Photo Upload Process
**Given** I select a photo
**When** the photo is being processed
**Then** selected photo crops to square and uploads
**And** upload progress is shown

### AC 5: Save Changes
**Given** I modify any field and tap save
**When** the save process executes
**Then** user_profiles table updates
**And** toast displays "Profile updated"
**And** I return to profile screen with updated info

## Tasks / Subtasks

### Task 1: Create EditProfileScreen (AC: #1, #2)
- [ ] Create EditProfileScreen in `app/profile/edit.tsx`
- [ ] Pre-populate form with current user data
- [ ] Add "Save" button in header
- [ ] Add back/cancel button
- [ ] Set screen title to "Edit Profile"

### Task 2: Build Form with React Hook Form (AC: #2)
- [ ] Set up React Hook Form with Zod validation
- [ ] Create form fields: first_name, last_name, phone_number
- [ ] Display email field as read-only with helper text
- [ ] Add validation rules (required fields, phone format)
- [ ] Show validation errors inline

### Task 3: Implement Photo Selection (AC: #3)
- [ ] Use expo-image-picker for photo selection
- [ ] Add "Take Photo" option (launch camera)
- [ ] Add "Choose from Library" option (launch photo library)
- [ ] Add "Remove Photo" option (set to null)
- [ ] Request necessary permissions (camera, photo library)
- [ ] Show action sheet or modal with options

### Task 4: Add Photo Cropping and Upload (AC: #4)
- [ ] Implement square crop using expo-image-manipulator
- [ ] Resize image to 500x500px for optimization
- [ ] Upload to Supabase Storage (profile-photos bucket)
- [ ] Generate unique filename: {user_id}_{timestamp}.jpg
- [ ] Show upload progress indicator
- [ ] Update profile_photo_url in database after upload

### Task 5: Implement Save Functionality (AC: #5)
- [ ] Create updateProfile mutation
- [ ] Validate form before saving
- [ ] Update user_profiles table with new values
- [ ] Handle update errors with error toast
- [ ] Show success toast "Profile updated"
- [ ] Navigate back to profile screen
- [ ] Invalidate profile query cache to refresh data

### Task 6: Add Loading and Error States
- [ ] Show skeleton while loading current profile data
- [ ] Display loading indicator during save
- [ ] Handle network errors gracefully
- [ ] Show validation errors for each field
- [ ] Prevent double-submission during save

## Dev Notes

### Form Schema with Zod
```typescript
const editProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  email: z.string().email().readonly(),
  profile_photo_url: z.string().url().nullable(),
});
```

### Photo Selection with Expo
```typescript
const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission to access photos is required!');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    await uploadPhoto(result.assets[0].uri);
  }
};
```

### Photo Upload to Supabase
```typescript
const uploadPhoto = async (uri: string) => {
  const fileName = `${user.id}_${Date.now()}.jpg`;
  const file = await fetch(uri).then(r => r.blob());

  const { data, error } = await supabase.storage
    .from('profile-photos')
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};
```

### Update Profile Mutation
```typescript
const updateProfile = useMutation({
  mutationFn: async (data: ProfileFormData) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        profile_photo_url: data.profile_photo_url,
      })
      .eq('id', user.id);

    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['user-profile']);
    toast.success('Profile updated');
    router.back();
  },
  onError: (error) => {
    toast.error('Failed to update profile');
  },
});
```

### Testing Considerations
- Test with all fields populated
- Test with missing optional fields
- Verify phone number validation
- Test photo selection, crop, and upload
- Verify email field is read-only
- Test save with no changes
- Test with network errors
- Validate back navigation without saving

## References

- [Source: epics.md#Epic 13 - Story 13.2]
- [Source: prd/pulau-prd.md#Profile & Settings]
- [Related: Story 13.1 - Build Profile Screen Layout]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
