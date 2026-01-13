# Story 9.4: Create Shareable Trip Links

Status: done

## Story

As a traveler,
I want to share my trip plan with others,
So that travel companions can see the itinerary.

## Acceptance Criteria

**AC #1: Share button opens share modal**
**Given** I am on the trip builder screen
**When** I tap the share button (top right)
**Then** a share modal opens with options:

- "Copy Link" - copies shareable URL to clipboard
- "Share via..." - opens native share sheet (mobile)

**AC #2: Generate shareable link with token**
**And** shareable link format: `https://pulau.app/trip/{share_token}`
**And** share_token is a unique UUID stored in trips.share_token

**AC #3: Display read-only trip view for shared links**
**When** someone opens the shared link
**Then** they see a read-only view of the trip
**And** read-only view shows: trip name, dates, all items with details, total price
**And** "Create your own trip" CTA at bottom
**And** shared trips do not require login to view

## Tasks / Subtasks

### Task 1: Add share button to trip builder header (AC: #1)

- [x] Add share icon button (Share2 from Lucide) to header
- [x] Position button in top-right corner next to trip name
- [x] Style with secondary/outline button styling
- [x] Add onClick handler to open share modal
- [x] Ensure 44px touch target for mobile

### Task 2: Create share modal with copy and native share options (AC: #1)

- [x] Build ShareTripModal component using shadcn/ui Dialog
- [x] Add "Copy Link" button with clipboard API integration
- [x] Add "Share via..." button triggering Web Share API
- [x] Show success toast after link copied: "Link copied!"
- [x] Handle Web Share API not available (desktop) gracefully

### Task 3: Generate and store share token (AC: #2)

- [x] Add share_token field to Trip data model (nullable string)
- [x] Generate UUID on first share: `crypto.randomUUID()`
- [x] Store share_token in trip via useKV
- [x] Reuse existing token on subsequent shares
- [x] Construct shareable URL: `${window.location.origin}/trip/${shareToken}`

### Task 4: Create read-only trip view page (AC: #3)

- [x] Build SharedTripView component/route
- [x] Parse share_token from URL path parameter
- [x] Fetch trip data by share_token from storage
- [x] Display trip in read-only format (no edit capabilities)
- [x] Show all trip details: name, dates, items, pricing
- [x] Handle invalid/expired tokens with 404 page

### Task 5: Add "Create your own trip" CTA (AC: #3)

- [x] Add CTA button at bottom of shared trip view
- [x] Button text: "Plan your own adventure"
- [x] Navigate to home screen or trip builder on click
- [x] Style as primary CTA (teal button)
- [x] Include Pulau branding/logo at bottom

## Dev Notes

### Technical Guidance

- Share token: store in trip.share_token field (add to Trip interface)
- Clipboard API: `navigator.clipboard.writeText(url)`
- Web Share API: `navigator.share({ title, text, url })` with fallback
- Read-only view: disable all edit interactions (inline edits, drag, remove buttons)
- Route: add `/trip/:shareToken` route to handle shared links

### Share Modal Implementation

```typescript
const ShareTripModal = ({ trip, isOpen, onClose }) => {
  const [shareToken, setShareToken] = useState(trip.share_token);

  const generateShareLink = async () => {
    if (!shareToken) {
      const token = crypto.randomUUID();
      await updateTrip({ share_token: token });
      setShareToken(token);
    }
    return `${window.location.origin}/trip/${shareToken}`;
  };

  const handleCopyLink = async () => {
    const url = await generateShareLink();
    await navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const handleNativeShare = async () => {
    const url = await generateShareLink();
    if (navigator.share) {
      await navigator.share({
        title: trip.name,
        text: `Check out my trip: ${trip.name}`,
        url
      });
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>Share your trip</DialogHeader>
        <Button onClick={handleCopyLink}>
          <Link className="icon" />
          Copy Link
        </Button>
        <Button onClick={handleNativeShare}>
          <Share2 className="icon" />
          Share via...
        </Button>
      </DialogContent>
    </Dialog>
  );
};
```

### Shared Trip View Route

```typescript
// In routing setup
<Route path="/trip/:shareToken" element={<SharedTripView />} />

// SharedTripView component
const SharedTripView = () => {
  const { shareToken } = useParams();
  const trip = useFetchTripByShareToken(shareToken);

  if (!trip) return <TripNotFound />;

  return (
    <div className="shared-trip-view">
      <TripHeader trip={trip} readOnly />
      <TripItinerary trip={trip} readOnly />
      <PriceSummary trip={trip} />
      <CTASection>
        <Button onClick={() => navigate('/')}>
          Plan your own adventure
        </Button>
      </CTASection>
    </div>
  );
};
```

### Data Structure Updates

```typescript
interface Trip {
  // ... existing fields
  share_token: string | null; // UUID for shareable link
  is_public: boolean; // Whether trip is shareable (default true)
}
```

### Visual Specifications

- Share modal: centered, max-width 400px
- Copy/Share buttons: full width, stacked vertically, 16px gap
- Read-only view: identical layout to trip builder, but no interactive elements
- CTA button: prominent, full-width on mobile, centered on desktop
- "Read-only" badge: subtle indicator in header

## References

- [Source: planning-artifacts/epics/epic-09.md#Epic 9, Story 9.4]
- [Source: prd/pulau-prd.md#Trip Sharing]
- [Technical: Web Share API Documentation]
- [Technical: Clipboard API Documentation]
- [Figma: Share Modal and Read-Only View]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
