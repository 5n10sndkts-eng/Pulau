# Story 13.5: Add Currency and Language Settings

Status: done

## Story

As an international traveler,
I want to set my preferred currency and language,
So that the app displays in my preferences.

## Acceptance Criteria

### AC 1: Preferences Screen Display

**Given** I tap "Preferences" from profile
**When** the preferences screen loads
**Then** I see currency selector: USD (default), EUR, GBP, AUD, SGD, IDR and language selector: English (default), Indonesian, Mandarin

### AC 2: Currency Change

**Given** I change currency
**When** the new currency is selected
**Then** all prices throughout app convert and display in new currency
**And** exchange rates fetched daily and cached
**And** user_preferences.currency persists selection

### AC 3: Language Change

**Given** I change language
**When** the new language is selected
**Then** app interface text changes to selected language
**And** user_preferences.language persists selection
**And** page refreshes to apply language change

## Tasks / Subtasks

### Task 1: Create Preferences Screen (AC: #1)

- [x] Create screen in `app/profile/preferences.tsx`
- [x] Add currency picker with 6 options
- [x] Add language picker with 3 options
- [x] Display current selections

### Task 2: Implement Currency Selection (AC: #2)

- [x] Save selected currency to user_preferences KV namespace
- [x] Create currency context/provider for app-wide access
- [x] Fetch exchange rates from API (exchangerate-api.com)
- [x] Cache rates for 24 hours
- [x] Update all price displays reactively

### Task 3: Implement Language Selection (AC: #3)

- [x] Set up i18n (react-i18next or expo-localization)
- [x] Add translation files for English, Indonesian, Mandarin
- [x] Save language to user_preferences
- [x] Apply language change across app
- [x] Restart/reload app sections as needed

### Task 4: Add Exchange Rate Service

- [x] Fetch rates from API daily
- [x] Store in local storage
- [x] Create useCurrency hook for price conversion
- [x] Format prices with currency symbols

## Dev Notes

### Currency Conversion

```typescript
const useCurrency = () => {
  const { currency } = usePreferences();
  const rates = useExchangeRates();

  const convert = (amountUSD: number) => {
    return amountUSD * rates[currency];
  };

  const format = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return { convert, format };
};
```

## References

- [Source: planning-artifacts/epics/epic-13.md#Epic 13 - Story 13.5]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List

- See `/src` directory for component implementations
