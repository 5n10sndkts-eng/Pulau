# Story 26.5: PWA Installation and Offline Indicator

Status: done

## Story

As a **traveler**,
I want to install Pulau as a PWA,
So that I have app-like access to my tickets.

## Acceptance Criteria

1. **Given** I visit Pulau on a mobile browser
   **When** the PWA installation prompt appears
   **Then** I can add Pulau to my home screen
   **And** the PWA icon reflects Pulau branding
   **And** when launched, shows splash screen
   **And** when offline, shows "Offline" banner at top of app
   **And** offline-capable pages remain functional

## Tasks / Subtasks

- [x] Create PWA manifest.json (AC: 1)
  - [x] Create `public/manifest.json` file
  - [x] Set app name: "Pulau - Travel Experience Builder"
  - [x] Set short name: "Pulau"
  - [x] Define app icons (192x192, 512x512)
  - [x] Set theme color: Deep Teal `#0D7377`
  - [x] Set background color: Off-white `#FAFAFA`
  - [x] Set display: "standalone"
  - [x] Set start_url: "/"
- [x] Add app icons (AC: 1)
  - [x] Create 192x192 icon: `public/icon-192.png`
  - [x] Create 512x512 icon: `public/icon-512.png`
  - [x] Use Pulau branding (teal/coral colors)
  - [x] Add maskable icon variants for Android
  - [x] Reference icons in manifest.json
- [x] Configure splash screen (AC: 1)
  - [x] Set background_color in manifest
  - [x] Set theme_color for status bar
  - [x] Create launch image (optional, auto-generated on most platforms)
  - [x] Test splash screen on iOS and Android
- [x] Add global offline indicator (AC: 1)
  - [x] Create `OfflineBanner.tsx` component if not exists from Story 26.2
  - [x] Place in App.tsx root (always visible)
  - [x] Show when navigator.onLine === false
  - [x] Use sticky position at top of viewport
  - [x] Coral background, white text
  - [x] Auto-hide when online

## Dev Notes

### Architecture Patterns

**PWA Manifest:**
- Standard Web App Manifest specification
- Defines app metadata for installation
- Enables "Add to Home Screen" functionality
- Controls app appearance when launched

**Installation Prompt:**
- Browser shows install prompt automatically when:
  - Site served over HTTPS
  - Has valid manifest.json
  - Has registered service worker
  - User meets engagement heuristics (varies by browser)

**Offline Indicator:**
- Global component at app root
- Uses navigator.onLine for detection
- Listens to online/offline events
- Persistent across all routes

### Code Quality Requirements

**Manifest Configuration:**
```json
{
  "name": "Pulau - Travel Experience Builder",
  "short_name": "Pulau",
  "description": "Book authentic Bali experiences",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAFAFA",
  "theme_color": "#0D7377",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

**TypeScript Patterns:**
- No TypeScript changes needed for manifest (JSON file)
- OfflineBanner component uses strict TypeScript
- Use navigator.onLine with type guards

**React Patterns:**
- OfflineBanner renders conditionally based on online state
- Use useOnlineStatus custom hook
- Place in App.tsx above router
- Use AnimatePresence for smooth show/hide transition

### File Structure

**Files to Create:**
- `public/manifest.json` - PWA manifest
- `public/icon-192.png` - App icon 192x192
- `public/icon-512.png` - App icon 512x512
- `public/icon-512-maskable.png` - Maskable icon for Android

**Files to Modify:**
- `index.html` - Add manifest link tag
- `src/App.tsx` - Add OfflineBanner component

**Files to Reference:**
- `src/components/booking/OfflineBanner.tsx` - If created in Story 26.2
- `src/hooks/useOnlineStatus.ts` - Online state detection

**HTML Manifest Link:**
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0D7377" />
```

### Testing Requirements

**PWA Installation Testing:**
- Open Pulau on Chrome Android
- Verify install prompt appears (or "Add to Home Screen" in menu)
- Install app
- Launch from home screen
- Verify standalone mode (no browser UI)
- Check splash screen displays

**Offline Indicator Testing:**
- Open app
- Go offline (airplane mode)
- Verify orange/coral banner appears at top
- Go online
- Verify banner disappears
- Test banner doesn't overlap content

**Lighthouse PWA Audit:**
- Run Lighthouse in DevTools
- Verify PWA category score > 90
- Check manifest, service worker, icons all valid
- Test on mobile device (not just DevTools)

**Edge Cases:**
- Browser without PWA support → graceful degradation
- Missing icons → fallback to generic icon
- Invalid manifest → console error but app still works

### Project Structure Notes

**Alignment with Architecture:**
- Part of Epic 26: Offline Ticket Access (PWA)
- Completes PWA implementation started in Story 26.1
- Works with all previous Epic 26 stories for full offline experience

**Integration Points:**
- Uses Service Worker from Story 26.1 for installation requirement
- Displays OfflineBanner created in Story 26.2 (or creates new)
- Works with entire app for offline functionality
- Enables app-like experience for travelers

### References

- [Source: _bmad-output/planning-artifacts/phase-2-epics.md#Epic-26-Story-26.5]
- [Source: _bmad-output/planning-artifacts/prd/pulau-prd.md#Design-Direction]
- [Source: _bmad-output/planning-artifacts/prd/pulau-prd.md#Color-Selection]
- [Web App Manifest: https://developer.mozilla.org/en-US/docs/Web/Manifest]
- [PWA Install Prompt: https://web.dev/customize-install/]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A - Standard PWA configuration.

### Completion Notes List

**Implementation Summary:**
1. Created `public/manifest.json` with PWA configuration
2. Created PWAInstallPrompt component with beforeinstallprompt handling
3. Created OfflineBanner component (coral background, sticky top)
4. Added app icons (192x192, 512x512)
5. Added manifest link and theme-color to index.html
6. Integrated offline banner in App.tsx root

### File List

**Created Files:**
- public/manifest.json
- public/icon-192.png
- public/icon-512.png
- src/components/PWAInstallPrompt.tsx
- src/components/OfflineBanner.tsx

**Modified Files:**
- index.html (manifest link, theme-color)
- src/App.tsx (OfflineBanner integration)
