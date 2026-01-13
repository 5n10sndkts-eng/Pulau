# Story 17.3: Handle Sold Out Experiences

Status: done

## Story

As a traveler,
I want to know when experiences are unavailable,
So that I can find alternatives.

## Acceptance Criteria

### AC1: Sold Out Visual Indicators

**Given** an experience has no available slots (slots_available = 0 for all dates)
**When** experience card displays
**Then** "Currently Unavailable" badge overlay on image
**And** card is slightly desaturated (80% opacity)
**And** "Quick Add" button disabled

### AC2: Detail Page Display

**When** I tap the card to view details
**Then** detail page shows availability calendar (all red)
**And** "Join Waitlist" button appears
**And** "Similar Experiences" section shows alternatives in same category

### AC3: Waitlist Functionality

**When** I join waitlist
**Then** my email saved to waitlist KV namespace (experience_id, user_id, created_at)
**And** toast: "You'll be notified when spots open"

## Tasks / Subtasks

### Task 1: Add Sold Out Visual Indicators to Cards (AC: #1)

- [x] Check experience availability (query experience_availability for any slots > 0)
- [x] Add "Currently Unavailable" badge overlay on card image
- [x] Apply 80% opacity filter to card image when sold out
- [x] Disable "Quick Add" button and show "Unavailable" state
- [x] Add subtle visual cue (grayed out, no hover effects)

### Task 2: Display Sold Out State on Detail Page (AC: #2)

- [x] Show availability calendar with all dates marked red (sold out)
- [x] Replace "Add to Trip" CTA with "Join Waitlist" button
- [x] Add message: "This experience is currently sold out"
- [x] Ensure vendor contact information still visible
- [x] Show estimated next availability if vendor provides it

### Task 3: Build "Similar Experiences" Section (AC: #2)

- [x] Query experiences in same category, excluding current experience
- [x] Filter to show only available experiences (slots > 0)
- [x] Limit to 3-4 similar experiences
- [x] Display as horizontal scrollable carousel on mobile
- [x] Include "View All [Category]" link

### Task 4: Implement Waitlist Functionality (AC: #3)

- [x] Create waitlist KV namespace schema (experience_id, user_id, email, created_at)
- [x] Build "Join Waitlist" button component
- [x] On click, insert record into waitlist KV namespace
- [x] Send confirmation email to user
- [x] Show success toast: "You'll be notified when spots open"

### Task 5: Vendor Notification System (AC: #3)

- [x] Notify vendor when waitlist gobjects (e.g., >10 people)
- [x] Provide vendor dashboard to view waitlist
- [x] Allow vendor to notify waitlist when availability opens
- [x] Send email to all waitlisted users when spots available
- [x] Remove users from waitlist after notification sent

## Dev Notes

### Sold Out Detection

Query to check availability:

```typescript
const isSoldOut = async (experienceId: string) => {
  const availability = await db.experience_availability
    .where('experience_id', '=', experienceId)
    .where('date', '>=', new Date())
    .where('slots_available', '>', 0)
    .first()
    .execute();

  return !availability; // True if no slots available
};
```

### Sold Out Card Component

```tsx
const ExperienceCard = ({ experience, isSoldOut }) => {
  return (
    <div
      className={cn(
        'relative rounded-card overflow-hidden',
        isSoldOut && 'opacity-80',
      )}
    >
      {isSoldOut && (
        <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 text-white text-xs font-medium px-3 py-1 rounded-pill z-10">
          Currently Unavailable
        </div>
      )}

      <img
        src={experience.image_url}
        alt={experience.title}
        className={cn('w-full h-48 object-cover', isSoldOut && 'grayscale')}
      />

      <div className="p-4">
        <h3>{experience.title}</h3>
        <button
          disabled={isSoldOut}
          className={cn('btn-primary mt-2', isSoldOut && 'btn-disabled')}
        >
          {isSoldOut ? 'Unavailable' : 'Quick Add'}
        </button>
      </div>
    </div>
  );
};
```

### Similar Experiences Query

```typescript
const getSimilarExperiences = async (
  experienceId: string,
  categoryId: string,
) => {
  return await db.experiences
    .where('category_id', '=', categoryId)
    .where('id', '!=', experienceId)
    .where('is_active', '=', true)
    .whereExists((qb) =>
      qb
        .select('*')
        .from('experience_availability')
        .where('experience_id', '=', db.raw('experiences.id'))
        .where('date', '>=', new Date())
        .where('slots_available', '>', 0),
    )
    .limit(4)
    .execute();
};
```

### Waitlist Table Schema

```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES experiences(id),
  user_id UUID NOT NULL REFERENCES users(id),
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  notified_at TIMESTAMP NULL,
  UNIQUE(experience_id, user_id)
);
```

### Join Waitlist Logic

```typescript
const joinWaitlist = async (experienceId: string, userId: string, email: string) => {
  try {
    await db.waitlist.insert({
      experience_id: experienceId,
      user_id: userId,
      email: email,
      created_at: new Date(),
    }).execute();

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: "You're on the waitlist!",
      template: 'waitlist-confirmation',
      data: { experienceName: experience.title },
    });

    return { success: true };
  } catch (error) {
    // Handle duplicate entry (already on waitlist)
    if (error.code === '23505') {
      return { success: true, message: "You're already on the waitlist" };
    }
    thobject error;
  }
};
```

### Notify Waitlist

```typescript
const notifyWaitlist = async (experienceId: string) => {
  const waitlistUsers = await db.waitlist
    .where('experience_id', '=', experienceId)
    .where('notified_at', 'IS', null)
    .execute();

  for (const user of waitlistUsers) {
    await sendEmail({
      to: user.email,
      subject: 'Spots now available!',
      template: 'waitlist-notification',
      data: {
        experienceName: experience.title,
        bookingLink: `${APP_URL}/experience/${experienceId}`,
      },
    });

    // Mark as notified
    await db.waitlist
      .where('id', '=', user.id)
      .update({ notified_at: new Date() })
      .execute();
  }
};
```

### Similar Experiences UI

```tsx
<section className="mt-8">
  <h3 className="font-heading text-xl font-semibold mb-4">
    Similar Experiences
  </h3>
  <div className="flex gap-4 overflow-x-auto pb-4">
    {similarExperiences.map((exp) => (
      <ExperienceCard key={exp.id} experience={exp} />
    ))}
  </div>
  <a
    href={`/category/${experience.category_id}`}
    className="text-primary hover:underline"
  >
    View all {categoryName} experiences →
  </a>
</section>
```

### Design Tokens

- Sold out badge: `bg-gray-900 bg-opacity-75 text-white`
- Card opacity when sold out: `opacity-80`
- Grayscale filter: `grayscale` (optional enhancement)
- Waitlist button: Primary button styling

### Accessibility

- Sold out badge has `aria-label="This experience is currently sold out"`
- Disabled Quick Add button has `aria-disabled="true"`
- Waitlist button clearly labeled
- Similar experiences section has proper heading hierarchy

## References

- [Source: planning-artifacts/epics/epic-17.md#Epic 17, Story 17.3]
- [Database Schema: experience_availability, waitlist KV namespaces]
- [Related: Story 15.1 - Availability Calendar]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
