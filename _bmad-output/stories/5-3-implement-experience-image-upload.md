# Story 5.3: Implement Experience Image Upload

Status: ready-for-dev

## Story

As a vendor,
I want to upload multiple photos for my experience,
so that travelers can see what I offer visually.

## Acceptance Criteria

1. **Given** I just created an experience (draft status) from Story 5.2 **When** I am on the image upload screen **Then** I can upload 4-6 images via file picker or drag-and-drop
2. Accepted formats are JPG, PNG, WebP (max 10MB each)
3. Images are automatically resized to max 1920x1080 maintaining aspect ratio
4. Images are uploaded to cloud storage (S3/CDN)
5. **When** upload completes for each image **Then** a record is created in experience_images table (experience_id, image_url, display_order)
6. display_order is set based on upload sequence
7. **When** I reorder images via drag-and-drop **Then** display_order values update in database
8. At least 3 images are required before publishing experience
9. Upload progress indicator shows for each image
10. Failed uploads show retry button

## Tasks / Subtasks

- [ ] Task 1: Create image upload UI (AC: #1, #9)
  - [ ] Create `src/screens/vendor/ExperienceImagesScreen.tsx`
  - [ ] Build drag-and-drop zone with visual feedback
  - [ ] Add file picker button as alternative
  - [ ] Display image thumbnails as they upload
  - [ ] Show progress bar for each uploading image
  - [ ] Show total progress (e.g., "3 of 6 uploaded")
- [ ] Task 2: Implement file validation (AC: #2)
  - [ ] Validate file type (JPG, PNG, WebP only)
  - [ ] Validate file size (max 10MB per image)
  - [ ] Show clear error for invalid files
  - [ ] Allow selecting multiple files at once
- [ ] Task 3: Implement image resizing (AC: #3)
  - [ ] Resize images to max 1920x1080 on client side
  - [ ] Maintain aspect ratio (no stretching)
  - [ ] Use canvas API for resizing
  - [ ] Convert to JPEG for consistent format
  - [ ] Compress to reasonable quality (~80%)
- [ ] Task 4: Implement image storage (AC: #4, #5, #6)
  - [ ] Store images as base64 in useKV (mock cloud storage)
  - [ ] Create experience_images records
  - [ ] Set display_order based on upload sequence
  - [ ] Link to experience_id
- [ ] Task 5: Implement image reordering (AC: #7)
  - [ ] Make uploaded images draggable
  - [ ] Visual feedback during drag (opacity, shadow)
  - [ ] Update display_order on drop
  - [ ] Smooth animation for reorder
- [ ] Task 6: Handle validation and errors (AC: #8, #10)
  - [ ] Show "3 images required" message if < 3
  - [ ] Disable "Continue" until 3+ images
  - [ ] Show retry button on failed uploads
  - [ ] Handle network errors gracefully
- [ ] Task 7: Add image management
  - [ ] Add delete button on each image
  - [ ] Confirm before deleting
  - [ ] Update display_order after deletion
  - [ ] Show "Cover Photo" badge on first image

## Dev Notes

- Images stored as base64 in useKV for MVP (no actual S3)
- Consider localStorage size limits (~5MB) - may need compression
- First image (display_order: 0) becomes hero/cover image
- Drag-and-drop: use @dnd-kit or similar library

### References

- [Source: epics.md#Story 5.3]
- [Source: prd/pulau-prd.md#Experience Imagery]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

