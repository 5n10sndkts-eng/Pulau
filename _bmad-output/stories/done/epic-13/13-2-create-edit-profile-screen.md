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
**Then** user_profiles KV namespace updates
**And** toast displays "Profile updated"
**And** I return to profile screen with updated info

## Tasks / Subtasks

### Task 1: Create EditProfile Component (AC: #1, #2)
- [ ] Create `EditProfile` component in `src/pages/EditProfile.tsx`
- [ ] Pre-populate form with current user data from KV store
- [ ] Add "Save Changes" button at bottom of form
- [ ] Add back/cancel button using React Router navigation
- [ ] Set page title to "Edit Profile" (using document.title or header component)

### Task 2: Build Form with React Hook Form (AC: #2)
- [ ] Set up React Hook Form with Zod validation
- [ ] Create form fields: firstName, lastName, phoneNumber
- [ ] Display email field as read-only with helper text "Contact support to change email"
- [ ] Add validation rules (required fields, phone format)
- [ ] Show validation errors inline using Tailwind error states

### Task 3: Implement Photo Selection (AC: #3)
- [ ] Add HTML file input with `accept="image/*"` for photo selection
- [ ] Create Radix UI DropdownMenu with options: "Upload Photo", "Remove Photo"
- [ ] Handle file input change event to read selected image
- [ ] Add camera capture option with `capture="user"` attribute (mobile)
- [ ] Show current profile photo with overlay button to trigger dropdown

### Task 4: Add Photo Processing and Storage (AC: #4)
- [ ] Convert selected image to base64 data URL for preview
- [ ] Implement client-side image cropping to square aspect ratio using Canvas API
- [ ] Resize image to 500x500px for optimization
- [ ] Store base64 image data in KV store under key `user:profile:photo:{userId}`
- [ ] Show upload progress indicator during processing
- [ ] Update profilePhotoUrl in user profile data after processing

### Task 5: Implement Save Functionality (AC: #5)
- [ ] Create updateProfile function using useKV hook
- [ ] Validate form before saving using React Hook Form validation
- [ ] Update KV store with key `user:profile:{userId}` with new values
- [ ] Handle update errors with toast notification component
- [ ] Show success toast "Profile updated" using Radix UI Toast
- [ ] Navigate back to profile screen using `navigate('/profile')`
- [ ] Trigger re-fetch of profile data to refresh display

### Task 6: Add Loading and Error States
- [ ] Show skeleton placeholders while loading current profile data from KV
- [ ] Display loading spinner during save operation
- [ ] Handle network errors gracefully with error boundaries
- [ ] Show validation errors for each field with Tailwind error styling
- [ ] Prevent double-submission during save with disabled button state

## Dev Notes

### TypeScript Interface
```typescript
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePhotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Form Schema with Zod
```typescript
import { z } from 'zod';

const editProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  email: z.string().email(), // Read-only, just for display
  profilePhotoUrl: z.string().url().nullable(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;
```

### Photo Selection with HTML File Input
```typescript
import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Camera, Upload, Trash2 } from 'lucide-react';

const PhotoUpload = ({ currentPhotoUrl, onPhotoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const croppedImage = await cropToSquare(dataUrl);
      onPhotoChange(croppedImage);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-32 h-32 mx-auto">
      <img 
        src={currentPhotoUrl || '/default-avatar.png'} 
        alt="Profile" 
        className="w-full h-full rounded-full object-cover"
      />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
            <Camera className="text-white" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
            <DropdownMenu.Item 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
            >
              <Upload size={16} />
              Upload Photo
            </DropdownMenu.Item>
            <DropdownMenu.Item 
              onClick={() => onPhotoChange(null)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-red-600"
            >
              <Trash2 size={16} />
              Remove Photo
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user" // Enable camera on mobile
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
```

### Image Cropping with Canvas API
```typescript
const cropToSquare = async (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = Math.min(img.width, img.height);
      canvas.width = 500;
      canvas.height = 500;
      
      const ctx = canvas.getContext('2d')!;
      const sourceX = (img.width - size) / 2;
      const sourceY = (img.height - size) / 2;
      
      ctx.drawImage(img, sourceX, sourceY, size, size, 0, 0, 500, 500);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = dataUrl;
  });
};
```

### Save Profile with KV Store
```typescript
import { useKV } from '@/hooks/useKV';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/toast';

const EditProfile = () => {
  const kv = useKV();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const userId = getCurrentUserId(); // Get from auth context
      return await kv.get<UserProfile>(`user:profile:${userId}`);
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: EditProfileFormData) => {
      const userId = getCurrentUserId();
      
      // Update profile data
      await kv.set(`user:profile:${userId}`, {
        ...profile,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        profilePhotoUrl: data.profilePhotoUrl,
        updatedAt: new Date().toISOString(),
      });

      // If photo changed, store separately
      if (data.profilePhotoUrl && data.profilePhotoUrl.startsWith('data:')) {
        await kv.set(`user:profile:photo:${userId}`, data.profilePhotoUrl);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
      navigate('/profile');
    },
    onError: (error) => {
      toast({
        title: 'Failed to update profile',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => updateProfile.mutate(data))}>
      {/* Form fields */}
    </form>
  );
};
```

### Complete Form Component Structure
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const EditProfile = () => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phoneNumber: profile?.phoneNumber || '',
      email: profile?.email || '',
      profilePhotoUrl: profile?.profilePhotoUrl || null,
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      <form onSubmit={handleSubmit((data) => updateProfile.mutate(data))} className="space-y-6">
        <PhotoUpload 
          currentPhotoUrl={profile?.profilePhotoUrl}
          onPhotoChange={(url) => setValue('profilePhotoUrl', url)}
        />

        <div>
          <label className="block text-sm font-medium mb-2">First Name</label>
          <input
            {...register('firstName')}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Last Name</label>
          <input
            {...register('lastName')}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <input
            {...register('phoneNumber')}
            type="tel"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            placeholder="+1234567890"
          />
          {errors.phoneNumber && (
            <p className="text-red-600 text-sm mt-1">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            {...register('email')}
            type="email"
            disabled
            readOnly
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-900 cursor-not-allowed"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Contact support to change your email address
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
```

### Testing Considerations
- Test with all fields populated
- Test with missing optional fields
- Verify phone number validation (international formats)
- Test photo selection, crop, and base64 conversion
- Verify email field is read-only and disabled
- Test save with no changes
- Test with network errors (KV store unavailable)
- Validate back navigation without saving (unsaved changes warning)
- Test dark mode styling
- Test responsive layout on mobile and desktop
- Verify accessibility (keyboard navigation, screen readers, ARIA labels)

## References

- [Source: planning-artifacts/epics/epic-13.md#Epic 13 - Story 13.2]
- [Source: planning-artifacts/prd/pulau-prd.md#Profile & Settings]
- [Related: Story 13.1 - Build Profile Screen Layout]
- [Architecture: ADR-001 - React Web Platform Choice]
- [Architecture: ADR-002 - KV Store Data Layer]

---

## Template Fix Notes (2026-01-06)

**Issues Fixed:**
1. ✅ File paths: `app/profile/edit.tsx` → `src/pages/EditProfile.tsx`
2. ✅ Photo selection: expo-image-picker → HTML file input with Radix UI DropdownMenu
3. ✅ Image processing: expo-image-manipulator → Canvas API for cropping
4. ✅ Storage: Supabase Storage → KV store with base64 data URLs
5. ✅ Data layer: Supabase queries (`supabase.from().update()`) → KV store (`kv.set()`)
6. ✅ Database schema: `user_profiles` KV namespace → TypeScript `UserProfile` interface
7. ✅ Navigation: `router.back()` → `navigate('/profile')` from React Router
8. ✅ Permissions: expo permissions API → Bobjectser native file input (no permissions needed)
9. ✅ Icons: Generic camera icon → Lucide React icons (Camera, Upload, Trash2)
10. ✅ Styling: React Native components → Tailwind CSS classes with dark mode
11. ✅ Toast notifications: Generic toast → Radix UI Toast component
12. ✅ PRD reference path: `prd/pulau-prd.md` → `planning-artifacts/prd/pulau-prd.md`
13. ✅ Added accessibility considerations (ARIA labels, keyboard navigation, screen readers)
14. ✅ Added dark mode support in all UI examples
15. ✅ Added TypeScript interfaces for type safety

**Root Cause:** Story was templated from React Native/Supabase project but implemented as React Web with GitHub Spark KV store.

**Verification:** Story now accurately reflects React Web architecture as documented in `_bmad-output/planning-artifacts/prd/pulau-prd.md` Technical Architecture section and ADR documents.

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
