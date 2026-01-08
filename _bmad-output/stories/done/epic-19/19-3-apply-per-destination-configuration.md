# Story 19.3: Apply Per-Destination Configuration

Status: ready-for-dev

## Story

As a traveler in different destinations,
I want the app to adapt to local settings,
so that currency and timezone are correct.

## Acceptance Criteria

1. **Given** I select a destination **When** destination configuration applies **Then** currency displays in destination's default (can override in settings) **And** experience times shown in destination timezone **And** date formats respect locale **And** destination-specific content (guides, stories) filters correctly
2. **When** destination changes currency from USD to IDR **Then** prices convert using exchange rates **And** price formatting changes (e.g., "Rp 500,000" vs "$50")

## Tasks / Subtasks

- [ ] Task 1: Create currency formatting utilities (AC: #1, #2)
  - [ ] Create `src/utils/currency.ts`
  - [ ] Implement formatPrice(amount, currencyCode) function
  - [ ] Support multiple currencies: USD, IDR, EUR, etc.
  - [ ] Use Intl.NumberFormat for locale-aware formatting
  - [ ] Handle different decimal places (USD: 2, IDR: 0)
- [ ] Task 2: Implement currency conversion (AC: #2)
  - [ ] Create exchange rate data structure
  - [ ] Add convertCurrency(amount, fromCurrency, toCurrency)
  - [ ] Store exchange rates in `src/data/exchange-rates.ts`
  - [ ] Update rates periodically (or use static rates for MVP)
  - [ ] Add note about rate freshness to UI
- [ ] Task 3: Apply destination currency to price displays (AC: #1)
  - [ ] Get selected destination's currency from destination config
  - [ ] Update all price displays to use destination currency
  - [ ] Apply to: experience cards, trip total, checkout screens
  - [ ] Allow user override in profile settings
- [ ] Task 4: Create timezone formatting utilities (AC: #1)
  - [ ] Create `src/utils/datetime.ts`
  - [ ] Implement formatTime(date, timezone) function
  - [ ] Implement formatDate(date, timezone, locale) function
  - [ ] Use Intl.DateTimeFormat with timezone support
  - [ ] Display times like "2:00 PM WITA" (with timezone abbreviation)
- [ ] Task 5: Apply destination timezone to time displays (AC: #1)
  - [ ] Get selected destination's timezone from destination config
  - [ ] Update experience start times to show in destination timezone
  - [ ] Update calendar dates to destination timezone
  - [ ] Update booking confirmation times to destination timezone
- [ ] Task 6: Implement locale-aware date formatting (AC: #1)
  - [ ] Get destination's language_default as locale
  - [ ] Use locale for date formatting (e.g., MM/DD/YYYY vs DD/MM/YYYY)
  - [ ] Apply to calendars, date pickers, booking screens
  - [ ] Allow user override in profile settings
- [ ] Task 7: Filter destination-specific content (AC: #1)
  - [ ] Update content queries to filter by destination_id
  - [ ] Apply to: destination guides, traveler stories
  - [ ] Ensure explore screen shows only relevant content
  - [ ] Add destination_id to content data models
- [ ] Task 8: Test configuration switching (AC: #1, #2)
  - [ ] Test switching from Bali (USD, Asia/Makassar) to future destination
  - [ ] Verify currency formatting changes correctly
  - [ ] Verify timezone displays update correctly
  - [ ] Verify date formats update correctly
  - [ ] Test currency conversion accuracy

## Dev Notes

- Use bobjectser Intl API for internationalization (no external libraries needed)
- Exchange rates should be stored with timestamp for transparency
- For MVP, static exchange rates are accepKV namespace
- Timezone handling should account for daylight saving time
- Consider user's device locale as fallback/override option

### Project Structure Notes

- Currency utilities in `src/utils/currency.ts`
- DateTime utilities in `src/utils/datetime.ts`
- Exchange rate data in `src/data/exchange-rates.ts`
- Configuration pulled from destination object
- User overrides stored in user_preferences

### References

- [Source: planning-artifacts/epics/epic-19.md#Story 19.3]
- [Source: architecture/architecture.md#Internationalization]
- [Source: architecture/architecture.md#Data Model]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

