# Story 28.1: Build Booking Search Interface

Status: done

## Story

As an **admin**,
I want to search bookings by various criteria,
So that I can find specific bookings for support.

## Acceptance Criteria

1. **Given** I am on the admin dashboard
   **When** I use the booking search
   **Then** I can search by:
   - Booking ID (exact match)
   - Traveler email (partial match)
   - Vendor name (partial match)
   - Date range
   - Booking status
   **And** results show key booking details
   **And** I can click a booking to view full details
   **And** search supports pagination for large result sets

## Tasks / Subtasks

- [ ] Create admin dashboard page (AC: 1)
  - [ ] Create `AdminDashboard.tsx` component
  - [ ] Add admin-only route (requires admin auth)
  - [ ] Create search interface layout
  - [ ] Add navigation tabs (Bookings / Refunds / Analytics)
- [ ] Build search form (AC: 1)
  - [ ] Add booking ID input (exact match)
  - [ ] Add traveler email input (fuzzy search)
  - [ ] Add vendor name input (fuzzy search)
  - [ ] Add date range picker (start and end date)
  - [ ] Add booking status dropdown (confirmed/cancelled/refunded/etc.)
  - [ ] Add "Search" button
  - [ ] Add "Clear Filters" button
- [ ] Implement search API (AC: 1)
  - [ ] Create `searchBookings` in bookingService.ts
  - [ ] Build dynamic query with multiple filters
  - [ ] Use Supabase ilike for partial matching (email, vendor name)
  - [ ] Use exact match for booking ID
  - [ ] Use date range filter on created_at or slot_time
  - [ ] Use status filter on booking.status
  - [ ] Return paginated results (25 per page)
- [ ] Display search results (AC: 1)
  - [ ] Show results in table or card list
  - [ ] Display: Booking ID, Traveler, Vendor, Date, Status
  - [ ] Make each result clickable → view booking detail
  - [ ] Add pagination controls (prev/next)
  - [ ] Show "No results" empty state

## Dev Notes

### Architecture Patterns

**Admin Authentication:**
- Requires admin role check (user.role === 'admin')
- Protect route with auth middleware
- Use Supabase RLS to enforce admin-only access
- Redirect non-admin users to home

**Search Query Building:**
```typescript
let query = supabase
  .from('bookings')
  .select(`
    *,
    user:users(name, email),
    experience:experiences(name),
    vendor:experiences(vendors(name))
  `)

if (bookingId) {
  query = query.eq('id', bookingId)
}
if (email) {
  query = query.ilike('users.email', `%${email}%`)
}
if (vendorName) {
  query = query.ilike('vendors.name', `%${vendorName}%`)
}
if (dateRange) {
  query = query.gte('created_at', dateRange.start)
               .lte('created_at', dateRange.end)
}
if (status) {
  query = query.eq('status', status)
}

query = query.range(page * 25, (page + 1) * 25 - 1)
```

**Pagination:**
- Use Supabase `.range(start, end)` for pagination
- Show 25 results per page
- Display page numbers and total count
- Use TanStack Query for caching and pagination

### Code Quality Requirements

**TypeScript Patterns:**
- Define SearchFilters interface:
  ```typescript
  interface SearchFilters {
    bookingId?: string
    email?: string
    vendorName?: string
    dateRange?: { start: string; end: string }
    status?: BookingStatus
  }
  ```
- Use ApiResponse pattern for search function
- Import Booking, User, Experience types

**React Patterns:**
- Use useState for search filters
- Use useQuery with pagination support
- Debounce email/vendor name inputs (300ms)
- Show loading skeleton during search

**Security:**
- Admin-only access enforced via RLS
- Rate limit search API to prevent abuse
- Log all search queries for audit
- Sanitize search inputs to prevent SQL injection

### File Structure

**Files to Create:**
- `src/components/admin/AdminDashboard.tsx` - Main admin page
- `src/components/admin/BookingSearchForm.tsx` - Search form
- `src/components/admin/BookingSearchResults.tsx` - Results display

**Files to Modify:**
- `src/App.tsx` - Add admin route
- `src/lib/bookingService.ts` - Add searchBookings function

**Files to Reference:**
- `src/lib/types.ts` - Booking, User, Experience types
- `src/hooks/useAdminAuth.ts` - Admin authentication hook (may need to create)

**Service Function:**
```typescript
export async function searchBookings(
  filters: SearchFilters,
  page: number = 0
): Promise<ApiResponse<{ bookings: Booking[]; total: number }>> {
  let query = supabase
    .from('bookings')
    .select('*, user:users(*), experience:experiences(*)', { count: 'exact' })

  // Apply filters...

  const { data, error, count } = await query.range(page * 25, (page + 1) * 25 - 1)

  if (error) return { data: null, error: error.message }
  return { data: { bookings: data, total: count || 0 }, error: null }
}
```

### Testing Requirements

**Manual Testing:**
- Login as admin user
- Navigate to admin dashboard
- Search by booking ID → verify exact match
- Search by email (partial) → verify fuzzy matching
- Search by vendor name → verify results
- Apply date range filter → verify correct bookings
- Filter by status → verify only matching statuses
- Test pagination (create > 25 test bookings)

**Edge Cases:**
- No results found (show empty state)
- Invalid date range (show validation error)
- Empty search (show all bookings, paginated)
- Special characters in search (handle escaping)

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 28: Admin Refunds & Audit Trail
- Implements FR-ADM-01: Booking search functionality
- Works with Epic 24 (checkout) for booking data
- Enables support workflows for refunds and disputes

**Integration Points:**
- Uses booking data from Epic 24
- Links to refund interface from Story 28.2
- Links to audit log from Story 28.4
- Uses admin authentication (may need separate implementation)

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-28-Story-28.1]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#FR-ADM-01]
- [Source: project-context.md#TanStack-Query-Hook-Pattern]
- [Supabase Pagination: https://supabase.com/docs/reference/javascript/range]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
