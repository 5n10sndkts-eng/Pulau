# Story 27.1: Build QR Code Scanner Interface

Status: done

## Story

As a **vendor**,
I want to scan traveler QR codes,
So that I can validate their tickets at check-in.

## Acceptance Criteria

1. **Given** I am on my vendor operations page
   **When** I tap "Scan Ticket"
   **Then** the device camera activates for QR scanning
   **And** I can scan any booking QR code
   **And** after successful scan, I see booking details:
   - Traveler name
   - Experience name
   - Time slot
   - Guest count
   - Check-in status

## Tasks / Subtasks

- [ ] Create vendor operations page (AC: 1)
  - [ ] Create `VendorOperationsPage.tsx` component
  - [ ] Add to vendor portal routing
  - [ ] Show "Scan Ticket" button prominently
  - [ ] Display today's date and time
- [ ] Implement QR scanner component (AC: 1)
  - [ ] Install QR scanning library (e.g., `react-qr-scanner` or `html5-qrcode`)
  - [ ] Create `QRScanner.tsx` component
  - [ ] Request camera permission on button click
  - [ ] Display camera feed in modal or full-screen
  - [ ] Decode QR code data
- [ ] Display booking details after scan (AC: 1)
  - [ ] Parse booking ID from QR code data
  - [ ] Fetch booking details from bookingService
  - [ ] Display booking info in card:
    - Traveler name
    - Experience name
    - Time slot (formatted)
    - Guest count
    - Current check-in status
  - [ ] Show action buttons: "Check In" or "Already Checked In"
- [ ] Handle scanner errors (AC: 1)
  - [ ] Show error if camera permission denied
  - [ ] Show error if QR code unreadable
  - [ ] Show error if booking not found
  - [ ] Provide "Try Again" button

## Dev Notes

### Architecture Patterns

**QR Scanner Libraries:**
- Recommended: `html5-qrcode` (vanilla JS, good browser support)
- Alternative: `react-qr-scanner` (React wrapper)
- Use browser's built-in camera API via library
- Handle camera permissions: `navigator.mediaDevices.getUserMedia()`

**QR Code Data Format:**
- QR contains booking ID (UUID or similar)
- Example: `pulau-booking://ABC123DEF456`
- Parse booking ID from scanned string
- Validate format before API call

**Vendor Portal:**
- Separate routing from customer app
- Route: `/vendor/operations` or `/vendor/check-in`
- Requires vendor authentication (from Epic 3 or Epic 22)
- Mobile-optimized for on-site use

### Code Quality Requirements

**TypeScript Patterns:**
- Define QRScanResult type:
  ```typescript
  type QRScanResult = 
    | { success: true; bookingId: string }
    | { success: false; error: string }
  ```
- Import Booking type from `src/lib/types.ts`
- Handle undefined camera stream

**React Patterns:**
- Use useState for scanner active state
- Use useEffect to clean up camera stream on unmount
- Use TanStack Query to fetch booking details
- Show loading spinner while fetching booking

**Error Handling:**
- Camera permission denied → "Please allow camera access"
- Invalid QR code → "Invalid ticket QR code"
- Booking not found → "Booking not found. Please check with customer."
- Network error → "Cannot verify ticket. Check internet connection."

### File Structure

**Files to Create:**
- `src/components/vendor/VendorOperationsPage.tsx` - Main operations page
- `src/components/vendor/QRScanner.tsx` - QR scanner component
- `src/components/vendor/BookingDetailsCard.tsx` - Scanned booking display

**Files to Modify:**
- `src/App.tsx` - Add vendor operations route
- `src/lib/bookingService.ts` - Add getBookingById function if not exists

**Dependencies to Add:**
```json
{
  "html5-qrcode": "^2.3.8"
}
```

**Scanner Implementation:**
```typescript
import { Html5QrcodeScanner } from 'html5-qrcode'

function QRScanner({ onScan }: { onScan: (bookingId: string) => void }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 })
    
    scanner.render(
      (decodedText) => {
        const bookingId = parseBookingId(decodedText)
        onScan(bookingId)
        scanner.clear()
      },
      (error) => console.error(error)
    )
    
    return () => scanner.clear()
  }, [onScan])
  
  return <div id="qr-reader" />
}
```

### Testing Requirements

**Manual Testing:**
- Open vendor operations page
- Click "Scan Ticket"
- Grant camera permission
- Scan test QR code (generate from booking confirmation)
- Verify booking details display correctly
- Test with invalid QR code
- Test with denied camera permission

**Test QR Codes:**
- Generate test QR codes for development
- Use booking IDs from test database
- Test with expired bookings
- Test with already checked-in bookings

**Edge Cases:**
- Camera not available (desktop browser) → show error message
- Multiple cameras (front/back) → allow camera selection
- Dark lighting → scanner may fail (educate vendors)
- Screen QR vs printed QR → both should work

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 27: Vendor Check-In & Operations
- Implements FR-OPS-02: QR code check-in
- Works with Epic 3 (Vendor Portal) for authentication
- Uses booking data from Epic 24 (checkout)

**Integration Points:**
- Uses vendor authentication from Epic 3 or Epic 22
- Fetches booking data from bookingService (Epic 24)
- Updates check-in status from Story 27.3
- Displays on operations page from Story 27.4

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-27-Story-27.1]
- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#FR-OPS-02]
- [html5-qrcode Documentation: https://github.com/mebjas/html5-qrcode]
- [MediaDevices API: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
