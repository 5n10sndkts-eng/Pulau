# Story 19.3: Apply Per-Destination Configuration

Status: done

## Story

As a traveler in different destinations,
I want the app to adapt to local settings,
so that currency and timezone are correct.

## Acceptance Criteria

1. **Given** I select a destination **When** destination configuration applies **Then** currency displays in destination's default (can override in settings) **And** experience times shown in destination timezone **And** date formats respect locale **And** destination-specific content (guides, stories) filters correctly
2. **When** destination changes currency from USD to IDR **Then** prices convert using exchange rates **And** price formatting changes (e.g., "Rp 500,000" vs "$50")

## Tasks / Subtasks

- [x] Task 1: Create currency formatting utilities (AC: #1, #2)
  - [x] Create `src/utils/currency.ts`
  - [x] Implement formatPrice(amount, currencyCode) function
  - [x] Support multiple currencies: USD, IDR, EUR, etc.
  - [x] Use Intl.NumberFormat for locale-aware formatting
  - [x] Handle different decimal places (USD: 2, IDR: 0)
- [x] Task 2: Implement currency conversion (AC: #2)
  - [x] Create exchange rate data structure
  - [x] Add convertCurrency(amount, fromCurrency, toCurrency)
  - [x] Store exchange rates in `src/data/exchange-rates.ts`
  - [x] Update rates periodically (or use static rates for MVP)
  - [x] Add note about rate freshness to UI
- [x] Task 3: Apply destination currency to price displays (AC: #1)
  - [x] Get selected destination's currency from destination config
  - [x] Update all price displays to use destination currency
  - [x] Apply to: experience cards, trip total, checkout screens
  - [x] Allow user override in profile settings
- [x] Task 4: Create timezone formatting utilities (AC: #1)
  - [x] Create `src/utils/datetime.ts`
  - [x] Implement formatTime(date, timezone) function
  - [x] Implement formatDate(date, timezone, locale) function
  - [x] Use Intl.DateTimeFormat with timezone support
  - [x] Display times like "2:00 PM WITA" (with timezone abbreviation)
- [x] Task 5: Apply destination timezone to time displays (AC: #1)
  - [x] Get selected destination's timezone from destination config
  - [x] Update experience start times to show in destination timezone
  - [x] Update calendar dates to destination timezone
  - [x] Update booking confirmation times to destination timezone
- [x] Task 6: Implement locale-aware date formatting (AC: #1)
  - [x] Get destination's language_default as locale
  - [x] Use locale for date formatting (e.g., MM/DD/YYYY vs DD/MM/YYYY)
  - [x] Apply to calendars, date pickers, booking screens
  - [x] Allow user override in profile settings
- [x] Task 7: Filter destination-specific content (AC: #1)
  - [x] Update content queries to filter by destination_id
  - [x] Apply to: destination guides, traveler stories
  - [x] Ensure explore screen shows only relevant content
  - [x] Add destination_id to content data models
- [x] Task 8: Test configuration switching (AC: #1, #2)
  - [x] Test switching from Bali (USD, Asia/Makassar) to future destination
  - [x] Verify currency formatting changes correctly
  - [x] Verify timezone displays update correctly
  - [x] Verify date formats update correctly
  - [x] Test currency conversion accuracy

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

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations

