# Pulau - Detailed Product Specification

Build a premium travel experience app called "Pulau" (Indonesian for "island") - a Bali-focused vacation builder that connects travelers with authentic local tours, activities, and hospitality services.

## CORE CONCEPT

This app serves as a bridge between modern travelers seeking seamless digital booking experiences and traditional Balinese hospitality operators who still run their businesses the old-fashioned way (phone calls, WhatsApp, cash transactions). The app aggregates these services into one elegant, easy-to-use platform where travelers can BUILD their entire Bali vacation piece by piece.

## SCALABILITY FOUNDATION

While launching in Bali, this app architecture must support expansion to other destinations (Thailand islands, Philippines, Portugal coast, etc.). Design all components with a "destination-agnostic" mindset - Bali is the first "destination package" but the UX patterns, booking flows, and data structures should work universally. Use "current destination" as a variable, not hardcoded references.

## TARGET USERS

**Primary**: International travelers (25-45) planning Bali trips who want:
- Authentic local experiences over tourist traps
- Easy booking without language barriers
- Flexible itinerary building
- One place to manage everything

**Secondary**: Digital nomads already in Bali looking for weekend activities and day trips

## APP STRUCTURE & SCREENS

### 1. ONBOARDING FLOW (3 screens max)

**Screen 1: Welcome**
- Beautiful full-screen Bali imagery with app logo
- "Build Your Bali Dream" tagline
- "Get Started" button

**Screen 2: Preference Selector**
Quick preference cards user can tap (multiple selections allowed):

Travel style section:
- Adventure
- Relaxation  
- Culture
- Mix of everything

Group type section:
- Solo
- Couple
- Friends
- Family

Budget feel section:
- Budget-conscious
- Mid-range
- Luxury

**Screen 3: Trip Dates**
- Arrival date picker
- Departure date picker
- "Skip for now - Just browsing" text link at bottom

### 2. HOME SCREEN - "Your Trip Canvas"

This is the emotional center of the app. NOT a typical list of services. Visualize it as a blank canvas that fills up as users build their trip.

**Layout:**

**Top Section:**
- Destination header with beautiful parallax image of Bali
- Trip dates displayed elegantly (or "Set your dates" prompt if not set)
- Location pin icon with "Bali, Indonesia"

**Main Area - Empty State:**
When user has no items added yet, show:
- Inspiring illustration or image
- Text: "Your Bali story starts here"
- Subtext: "What sounds amazing?"

**Category Grid:**
Below the empty state prompt, show 6 category cards in a 2x3 grid. Each card has an icon, background image, and label:

1. 🏝️ **Destinations & Stays** - "Where will you wake up?"
2. 🚤 **Water Adventures** - "Boat trips, snorkeling, diving"
3. 🚴 **Land Explorations** - "Bikes, scooters, guided treks"
4. 🎭 **Culture & Experiences** - "Temples, ceremonies, cooking classes"
5. 🍽️ **Food & Nightlife** - "Local warungs to beach clubs"
6. 🚐 **Getting Around** - "Transfers, drivers, day trips"

**Bottom Floating Bar (appears after first item added):**
- Shows: Item count icon with number
- Estimated total price
- "View Trip" button

**Filled State:**
As user adds items, the main area transforms to show thumbnail previews of booked experiences in a visual collage grid, creating anticipation for their adventure.

**Interaction Pattern:**
When user taps a category, smooth slide transition to category browser. When they add something, satisfying micro-animation shows item "flying" down to the trip bar.

### 3. CATEGORY BROWSER SCREEN

**Example: Water Adventures**

**Header:**
- Back arrow
- Category title "Water Adventures"
- Search icon

**Filter Section:**
Horizontally scrollable filter chips:
[All] [Beginner Friendly] [Half Day] [Full Day] [Private] [Group] [Under $50] [Top Rated]

**Smart Recommendation Banner:**
At top of list, highlighted card:
"Perfect for you" based on onboarding preferences
If user selected "Relaxation" + "Couple", show private sunset cruise first

**Content List:**
Vertical scrolling cards, each card contains:
- Hero image (16:9 ratio, high quality, with slight rounded corners)
- Small provider badge overlay on image: "Wayan's Dive Shop"
- Experience title below image: "Sunrise Snorkeling at Menjangan Island"
- Quick stats row with icons: ⏱️ 6 hours | 👥 Max 8 people | ⭐ 4.9 (127 reviews)
- Price line: "From $65 / person"
- Two buttons side by side: [+ Quick Add] primary button | [See Details] text link

**Empty State:**
If no results match filters:
- Friendly illustration
- "No experiences match these filters"
- "Try adjusting your filters or explore all options"
- [Clear Filters] button

### 4. EXPERIENCE DETAIL SCREEN

Premium, informative, trustworthy feel. This is where users decide to commit.

**A. Hero Section**
- Full-width image carousel (swipeable, 4-6 images)
- Dot indicators at bottom of carousel
- Floating circular back button (top left, semi-transparent background)
- Floating heart/save button (top right)
- Gradient overlay at bottom of image fading to content
- Experience title overlaid on gradient

**B. Quick Info Bar**
Single row with icons and labels:
⏱️ 6 hours | 👥 2-8 guests | 📊 Moderate | 🗣️ English, Indonesian

**C. Booking Action Box**
Prominent card that becomes sticky when scrolling past it:
- "From $65 per person" in large text
- Date selector dropdown (showing available dates)
- Guest count stepper with +/- buttons (price updates live as count changes)
- Large primary button: "Add to Trip - $130" (shows calculated total)
- Small text below: "Free cancellation up to 24 hours before"

**D. About This Experience**
Section with heading "About This Experience"
3-4 paragraphs of engaging description in second person:
"You'll meet your guide at dawn as the fishing boats head out to sea. The water at this hour is impossibly calm, and as you slip beneath the surface, you'll discover a coral garden that few tourists ever see..."

**E. What's Included**
Section with heading "What's Included"
Checklist with green checkmarks:
✓ Hotel pickup & drop-off (Ubud, Seminyak, Canggu areas)
✓ Professional snorkeling equipment
✓ Licensed English-speaking guide
✓ Tropical breakfast and lunch
✓ Underwater photos sent same day
✓ Towels and dry bag

Section with heading "Not Included"
Checklist with X marks:
✗ Tips for crew (suggested: 50,000 IDR)
✗ Additional drinks

**F. Meet Your Local Operator**
Card with warm background color:
- Circular photo of operator/owner
- Name: "Wayan's Dive Shop"
- Tagline: "Family operated since 1998"
- Short bio paragraph: "Wayan learned to freedive from his father at age 7 in the waters off Lovina. After working as a dive instructor across Indonesia, he returned home to start his own operation, now run with his wife Ketut and their two sons..."
- Badge row: [Local Business] [Verified Partner] [Responds in 2 hours]
- Button: "Message Operator" (for special requests)

**G. Reviews Section**
Section heading: "What Travelers Say"
- Large rating: "4.9" with star icon
- Review count: "127 reviews"
- Rating breakdown bars (5 star: 90%, 4 star: 7%, etc.)

Subheading: "Traveler Photos"
- Horizontal scrollable row of user-submitted photos

Review cards (show 3, with "See all reviews" link):
Each card shows:
- Reviewer first name and country flag emoji
- Date: "December 2024"
- Star rating (5 stars shown as icons)
- Review text (truncated at 3 lines with "read more" link)
- "Helpful" button with count

**H. Meeting Point**
Section heading: "Where You'll Meet"
- Embedded map showing pickup zone or meeting location (static map image is fine for prototype)
- Address text with copy icon button
- "Get Directions" link

**I. Cancellation & Policies**
Section heading: "Good to Know"
- Cancellation policy in friendly language: "Plans change, we get it. Cancel up to 24 hours before for a full refund, no questions asked."
- What to bring: "Sunscreen, swimwear, camera, sense of adventure"
- Health/safety notes if relevant

**J. You Might Also Like**
Section heading: "Similar Experiences"
- Horizontal scroll of 3-4 smaller experience cards
- Each card: image, title, price, rating

### 5. TRIP BUILDER / MY TRIP SCREEN

The shopping cart reimagined as a visual itinerary planner.

**Header:**
- "Your Bali Trip" title
- Date range: "March 15-22, 2025" (tappable to edit)
- Share icon button (generates shareable link)

**View Toggle:**
Two-button toggle: [Calendar View] [List View]

**Calendar View:**
Monthly calendar grid with:
- Days with activities show colored dots
- Tapping a day shows that day's items in a bottom sheet
- Visual overview of trip density

**List View (Default):**
Organized by day with timeline visual:
━━━ DAY 1 ━━━━━━━━━━━━━━━━━━━━━━━━━
Saturday, March 15
✈️ Arriving in Bali
┌─────────────────────────────┐
│ 🚐 Airport Pickup to Ubud   │
│    2:00 PM · 1.5 hours      │
│    $25                      │
│    [Edit] [Remove]          │
└─────────────────────────────┘
Evening free
[+ Add something for evening]
━━━ DAY 2 ━━━━━━━━━━━━━━━━━━━━━━━━━
Sunday, March 16
┌─────────────────────────────┐
│ 🚴 Rice Terrace Cycling     │
│    7:00 AM · 4 hours        │
│    $45 × 2 guests = $90     │
│    [Edit] [Remove]          │
└─────────────────────────────┘
Afternoon & evening free
[+ Add something]
━━━ DAY 3 ━━━━━━━━━━━━━━━━━━━━━━━━━
Monday, March 17
┌─────────────────────────────┐
│ 🚤 Nusa Penida Island Trip  │
│    6:00 AM · Full day       │
│    $85 × 2 guests = $170    │
│    [Edit] [Remove]          │
└─────────────────────────────┘

[+ Add Another Day] button at end

**Each Item Card Shows:**
- Category icon
- Experience title
- Time and duration
- Price (with guest multiplication shown)
- Compact action buttons: Edit, Remove

**Unscheduled Items Section:**
If user added items without assigning dates:
- Section heading: "Not Yet Scheduled"
- List of items with "Assign to Day" button on each
- Or drag-and-drop to a day above

**Conflict Warning:**
If two items overlap in time:
- Yellow warning banner
- "Heads up: Your cycling tour and cooking class overlap on Day 2"
- Suggestion to adjust

**Bottom Summary Bar (Always Visible, Sticky):**
┌─────────────────────────────────────┐
│  🎒 7 experiences · 5 days          │
│                                     │
│  Subtotal           $487.00         │
│  Service fee         $24.35         │
│  ───────────────────────────        │
│  Total              $511.35         │
│                                     │
│  [ Continue to Booking ]            │
│         Large primary button        │
└─────────────────────────────────────┘

**Empty State:**
If no items added:
- Illustration of empty suitcase or blank map
- "Your trip is waiting to be built"
- "Browse experiences and add them here"
- [Start Exploring] button

### 6. BOOKING & CHECKOUT FLOW

Multi-step flow with progress indicator at top.

**Progress Bar:**
Step 1 (Review) → Step 2 (Details) → Step 3 (Payment) → Step 4 (Confirmed)
Show as connected dots with labels, current step highlighted

**Step 1: Review Your Trip**

Heading: "Review Your Trip"

Compact list of all items:
Each row shows: Date | Experience name | Guests | Price
Tappable to expand details

Conflict checker results:
- Green checkmark: "No scheduling conflicts found"
- Or yellow warning if issues exist

Special requests summary if any were added

Total at bottom

[Continue] button

**Step 2: Traveler Details**

Heading: "Who's Traveling?"

Lead Traveler card:
- First name field
- Last name field
- Email field
- Phone field with country code dropdown
- Nationality dropdown

Additional Travelers section (if guest count > 1):
"Traveler 2", "Traveler 3" etc.
- First name field
- Last name field
- Nationality dropdown

Special Requests section:
- Text area with placeholder: "Allergies, accessibility needs, dietary restrictions, celebrating something special?"
- Character count indicator

[Continue] button

**Step 3: Payment**

Heading: "Payment"

Order Summary card:
- Itemized list (collapsible)
- Subtotal
- Service fee (with info icon explaining it)
- Promo code field with [Apply] button
- Total in bold

Payment Method section:
- Credit/Debit Card option (Visa, Mastercard, Amex icons)
  - Card number field
  - Expiry field
  - CVV field
  - Name on card field
- PayPal option
- Apple Pay / Google Pay option (if available)

Terms checkbox:
"I agree to the Terms of Service and Cancellation Policy"

[Pay $511.35] button - large, prominent

Security badges: "Secure payment" with lock icon, "256-bit encryption"

**Step 4: Confirmation**

Success state:
- Animated checkmark or confetti animation
- "You're going to Bali!" heading
- Booking reference: "PUL-2025-78234" (large, copyable)

Confirmation details card:
- Trip dates
- Number of experiences booked
- Total paid
- "Confirmation email sent to [email]"

Quick Actions:
- [View Your Trip] primary button
- [Add to Calendar] secondary button with calendar icon
- [Share with Friends] secondary button with share icon

What's Next section:
- "Your booking confirmations will arrive by email within 1 hour"
- "Local operators may contact you to confirm pickup details"
- "Download the app for easy access to your trip on the go"

### 7. ACTIVE TRIP MODE (During Travel Dates)

When user's trip dates arrive, the home screen transforms.

**Header changes to:**
"Day 3 of Your Bali Adventure"
Current date prominently displayed

**Today's Schedule (Main Focus):**
Timeline view of today's activities:
- Current/next activity highlighted
- Countdown: "Snorkeling trip starts in 2 hours"
- Quick access buttons on each item: [View Details] [Get Directions] [Contact Operator]

**Quick Access Cards:**
Row of cards for:
- "My Confirmations" - all booking confirmations with QR codes
- "Emergency Contacts" - local emergency numbers, operator contacts
- "Today's Weather" - weather widget

**Tomorrow Preview:**
Collapsed section showing tomorrow's first activity

**Bottom Action:**
"Need something last minute?" → Opens category browser filtered to "Available Today"

### 8. EXPLORE / DISCOVERY SCREEN

For browsing without specific intent. Tab bar item labeled "Explore"

**Search Bar:**
Prominent at top with placeholder: "Search experiences, places, activities..."

**Content Sections (Vertical Scroll):**

**Section 1: "Trending in Bali"**
- Horizontal scroll of experience cards
- Shows most-booked experiences this week

**Section 2: "Hidden Gems"**
- Horizontal scroll
- Lesser-known local favorites
- Badge: "Local Secret"

**Section 3: "Limited Availability"**
- Experiences with few spots left or special seasonal offerings
- Urgency indicator: "Only 3 spots left for this week"

**Section 4: "Destination Guides"**
Tappable cards for different areas:
- "First Time in Ubud? Start here"
- "Canggu: Surf, Coffee & Sunsets"
- "The Gili Islands Day Trip Guide"
Each opens a curated collection of experiences

**Section 5: "Stories from Travelers"**
- User-generated content style
- Photo with short caption/review
- "Sarah from Australia did 5 experiences" → tappable to see what she did

### 9. SAVED / WISHLIST SCREEN

Accessed via heart icon in tab bar or profile

**Heading:** "Saved Experiences"

**Content:**
Grid or list of saved experiences:
- Each card shows image, title, price, rating
- Heart icon (filled) to unsave
- [Add to Trip] button

**Empty State:**
- Heart illustration
- "Save experiences you love"
- "Tap the heart icon on any experience to save it here"
- [Browse Experiences] button

### 10. PROFILE & SETTINGS SCREEN

Accessed via profile icon in tab bar

**Profile Header:**
- Profile photo (or placeholder initial)
- User name
- Member since date
- [Edit Profile] button

**My Trips Section:**
- "Upcoming Trips" - cards of upcoming trips (tappable)
- "Past Trips" - cards of completed trips with "Book Again" option

**Quick Links:**
List items with chevron arrows:
- Payment Methods
- Notifications
- Currency (showing current: USD)
- Language (showing current: English)
- Help & Support
- About Pulau
- Terms of Service
- Privacy Policy

**Sign Out button** at bottom

**App Version** small text at very bottom

### 11. BOTTOM TAB BAR

5 tabs:
1. Home icon - "Trip" - Goes to Trip Canvas/Home
2. Compass icon - "Explore" - Goes to Discovery screen
3. Plus icon in circle (prominent) - Quick Add - Opens category selector modal
4. Heart icon - "Saved" - Goes to wishlist
5. Person icon - "Profile" - Goes to profile

## UX PRINCIPLES (CRITICAL - Follow These)

1. **Progressive Disclosure**: Never overwhelm. Show what's needed, reveal more on demand. Details expand, not displayed all at once.

2. **Visual Storytelling**: Every screen should feel like a travel magazine, not a booking engine. High-quality images do the heavy lifting. Minimal text where images can communicate.

3. **Forgiving & Flexible**: Users can add, remove, reschedule freely until final booking. No "are you sure?" confirmation dialogs for adding/removing from trip. Easy to undo.

4. **Trust Building**: Surface local operator stories and photos. Show real reviews prominently. Display clear pricing - never hidden fees. Show "What's Included" clearly.

5. **Delightful Micro-interactions**:
   - Adding item to trip = item thumbnail animates flying to trip bar
   - Completing booking = confetti or celebration animation
   - Heart/save = heart fills with pop animation
   - Pull to refresh = custom wave or tropical themed loader
   - Scrolling image carousels = smooth with subtle parallax

6. **Mobile-First, Thumb-Friendly**: 
   - Primary actions in bottom 60% of screen
   - One-handed operation possible
   - Minimum tap target size 44x44 pixels
   - Floating action buttons within easy reach

7. **Offline Consideration**: Show "Last updated" timestamp. Booked trip details should feel accessible even without visual network indicator.

## DESIGN AESTHETIC

**Color Palette:**
- Primary: Deep teal #0D7377 - ocean/tropical, trustworthy
- Secondary: Warm coral #FF6B6B - sunset warmth, call-to-action accents
- Accent: Golden sand #F4D03F - highlights, stars, premium indicators
- Success: Soft green #27AE60
- Warning: Amber #F39C12
- Error: Soft red #E74C3C
- Background: Off-white #FAFAFA
- Card background: Pure white #FFFFFF
- Text primary: Charcoal #2D3436
- Text secondary: Gray #636E72
- Dark mode background: Deep navy #1A1A2E
- Dark mode card: #252542

**Typography:**
- Headlines: Plus Jakarta Sans Bold or DM Sans Bold
- Subheadings: Plus Jakarta Sans SemiBold
- Body: Inter Regular (highly readable)
- Small/Caption: Inter Medium
- Optional accent: One script/handwritten font for special callouts like "Local favorite" (use very sparingly)

**Font Sizes:**
- Large title: 28-32px
- Title: 22-24px
- Headline: 18-20px
- Body: 16px
- Caption: 14px
- Small: 12px

**Imagery Style:**
- Vibrant but natural colors (avoid over-saturated)
- Real people in photos, candid moments over posed stock
- Golden hour / magic hour lighting preferred
- Mix of wide landscape shots and intimate detail moments
- Local life - not just tourist attractions

**Iconography:**
- Rounded, friendly line icons
- Consistent 2px stroke weight
- Custom category icons with subtle Balinese/tropical influence
- Lucide icons or Phosphor icons as base

**UI Components:**
- Border radius: 12-16px for cards, 8px for buttons, 24px for chips/pills
- Shadows: Subtle, layered (e.g., 0 2px 8px rgba(0,0,0,0.08))
- Cards: White background, subtle shadow, generous padding (16-20px)
- Buttons: Full-width for primary actions, minimum height 48px
- Input fields: Large, clear labels above, 48px height minimum

**Spacing System:**
- Base unit: 4px
- Common spacing: 8px, 12px, 16px, 20px, 24px, 32px, 48px
- Card padding: 16px or 20px
- Section spacing: 24px or 32px
- Screen edge margins: 16px or 20px

## INTERACTION FLOWS TO BUILD

1. **Onboarding Flow**: Welcome → Preferences → Dates → Home (with preferences stored)

2. **Browse & Add Flow**: Home → Category → Experience List → Experience Detail → Add to Trip (with animation) → Return to browsing or View Trip

3. **Trip Building Flow**: Add items → View trip → Rearrange/assign dates → Remove items → See total update

4. **Checkout Flow**: Review → Traveler details → Payment → Confirmation

5. **Search Flow**: Search bar → Instant results → Select result → Experience detail

6. **Save/Wishlist Flow**: Tap heart on any experience → Heart animates → Item appears in Saved tab

7. **Filter Flow**: Tap filter chip → Apply → Results update → Clear filters

## STATES TO DESIGN

**Loading States:**
- Skeleton screens for experience lists (gray placeholders in card shapes)
- Spinner for checkout processing
- Progress bar for image loading

**Empty States:**
- Empty trip: Illustration + encouraging message + CTA
- Empty search results: Illustration + "No matches" + suggestions
- Empty wishlist: Heart illustration + "Start saving" message

**Error States:**
- Network error: "Connection lost" + retry button
- Booking failed: Clear error message + contact support option
- Payment failed: Specific error + retry option

**Success States:**
- Added to trip: Toast notification with checkmark
- Booking confirmed: Full-screen success with animation
- Saved to wishlist: Heart animation + subtle toast

## TECHNICAL REQUIREMENTS

- Use React with hooks for state management
- Store trip data in localStorage for persistence across sessions
- Implement smooth page transitions (slide animations)
- Lazy load images for performance
- Responsive design: Mobile-first, but functional at tablet and desktop widths
- Minimum touch targets: 44x44 pixels
- Implement pull-to-refresh where appropriate
- Add haptic feedback hints in interactions where supported

## SUCCESS CRITERIA

A traveler should be able to:
1. Open the app and immediately understand what it does
2. Set their preferences and trip dates
3. Browse experiences and feel excited about possibilities
4. Build a 5-day trip with 6+ activities in under 10 minutes
5. Feel confident about what they're booking (clear pricing, inclusions, reviews)
6. Complete checkout with all their information
7. View their trip and clearly understand their daily schedule
8. Save experiences for later consideration

The overall feeling should be: "Finally, someone made trip planning feel like the adventure itself."
