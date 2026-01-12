### Story 5.3: Implement Experience Image Upload

As a vendor,
I want to upload multiple photos for my experience,
So that travelers can see what I offer visually.

**Acceptance Criteria:**

**Given** I just created an experience (draft status) from Story 5.2
**When** I am on the image upload screen
**Then** I can upload 4-6 images via file picker or drag-and-drop
**And** accepted formats are JPG, PNG, WebP (max 10MB each)
**And** images are automatically resized to max 1920x1080 maintaining aspect ratio
**And** images are uploaded to cloud storage (S3/CDN)
**When** upload completes for each image
**Then** a record is created in experience_images table (experience_id, image_url, display_order)
**And** display_order is set based on upload sequence
**When** I reorder images via drag-and-drop
**Then** display_order values update in database
**And** at least 3 images are required before publishing experience
**And** upload progress indicator shows for each image
**And** failed uploads show retry button
