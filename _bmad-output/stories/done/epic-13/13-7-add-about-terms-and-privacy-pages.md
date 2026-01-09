# Story 13.7: Add About, Terms, and Privacy Pages

Status: done

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
- [x] Create screen in `app/profile/about.tsx`
- [x] Display Pulau logo
- [x] Show app version from package.json
- [x] Add company description text
- [x] Add links to Terms, Privacy, Licenses

### Task 2: Create Terms and Privacy Pages (AC: #2)
- [x] Create terms.md and privacy.md in assets
- [x] Use react-native-markdown-display for rendering
- [x] Or use WebView for HTML content
- [x] Add navigation to these pages
- [x] Ensure proper scrolling and formatting

### Task 3: Add License Information
- [x] Generate licenses file (expo-licenses or manually)
- [x] Display open source licenses
- [x] Link to respective repositories

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

- [Source: planning-artifacts/epics/epic-13.md#Epic 13 - Story 13.7]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

