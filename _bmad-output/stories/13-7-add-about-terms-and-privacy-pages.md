# Story 13.7: Add About, Terms, and Privacy Pages

Status: ready-for-dev

## Story

As a user,
I want to access legal and company information,
So that I understand the service.

## Acceptance Criteria

### AC 1: About Screen Display
**Given** I tap "About Pulau" from profile
**When** the about screen loads
**Then** I see: Pulau logo and tagline, app version number, brief company description, links: "Terms of Service", "Privacy Policy", "Licenses"

### AC 2: Terms and Privacy Navigation
**Given** I tap Terms or Privacy
**When** the respective page opens
**Then** respective policy page opens (markdown rendered or webview)
**And** content loads from static files or CMS
**And** pages are scrollable with proper formatting

## Tasks / Subtasks

### Task 1: Create About Screen (AC: #1)
- [ ] Create screen in `app/profile/about.tsx`
- [ ] Display Pulau logo
- [ ] Show app version from package.json
- [ ] Add company description text
- [ ] Add links to Terms, Privacy, Licenses

### Task 2: Create Terms and Privacy Pages (AC: #2)
- [ ] Create terms.md and privacy.md in assets
- [ ] Use react-native-markdown-display for rendering
- [ ] Or use WebView for HTML content
- [ ] Add navigation to these pages
- [ ] Ensure proper scrolling and formatting

### Task 3: Add License Information
- [ ] Generate licenses file (expo-licenses or manually)
- [ ] Display open source licenses
- [ ] Link to respective repositories

## Dev Notes

### Version Display
```typescript
import { version } from '../../package.json';
<Text>Version {version}</Text>
```

### Markdown Rendering
```typescript
import Markdown from 'react-native-markdown-display';
import termsContent from './assets/terms.md';

<Markdown>{termsContent}</Markdown>
```

## References

- [Source: epics.md#Epic 13 - Story 13.7]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
