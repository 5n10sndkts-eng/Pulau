# Story 13.5: Add Currency and Language Settings

Status: ready-for-dev

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
- [ ] Create screen in `app/profile/preferences.tsx`
- [ ] Add currency picker with 6 options
- [ ] Add language picker with 3 options
- [ ] Display current selections

### Task 2: Implement Currency Selection (AC: #2)
- [ ] Save selected currency to user_preferences KV namespace
- [ ] Create currency context/provider for app-wide access
- [ ] Fetch exchange rates from API (exchangerate-api.com)
- [ ] Cache rates for 24 hours
- [ ] Update all price displays reactively

### Task 3: Implement Language Selection (AC: #3)
- [ ] Set up i18n (react-i18next or expo-localization)
- [ ] Add translation files for English, Indonesian, Mandarin
- [ ] Save language to user_preferences
- [ ] Apply language change across app
- [ ] Restart/reload app sections as needed

### Task 4: Add Exchange Rate Service
- [ ] Fetch rates from API daily
- [ ] Store in local storage
- [ ] Create useCurrency hook for price conversion
- [ ] Format prices with currency symbols

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

### Debug Log References

### Completion Notes List

### File List
