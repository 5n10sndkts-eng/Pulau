---
stepsCompleted: [1, 2, 3]
inputDocuments: ['pulau-prd.md', 'project-context.md', 'docs/architecture.md']
workflowType: 'architecture'
project_name: 'Pulau'
user_name: 'Moe'
date: '2026-01-05'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The Pulau application delivers 6 core features forming a complete travel booking experience:

1. **Trip Canvas Building** - Visual itinerary builder with calendar view, real-time pricing, and item management
2. **Experience Discovery** - Categorized browsing with filters (difficulty/duration/price), personalized recommendations
3. **Experience Detail Pages** - Rich media galleries, provider profiles, reviews, dynamic pricing calculator
4. **Multi-Step Checkout** - 4-step wizard (Review → Traveler Details → Payment → Confirmation)
5. **Onboarding Preferences** - 3-screen preference capture for personalization engine
6. **Booking Dashboard** - Trip history with status tracking, rebooking functionality

**Non-Functional Requirements:**
- **Performance**: Instant filter updates, <10 min trip building workflow
- **Offline Resilience**: Local data persistence via Spark KV
- **Mobile-First**: 44x44px touch targets, responsive breakpoints at 640px/768px/1024px
- **Accessibility**: WCAG 2.1 AA color contrast, semantic HTML, Radix primitives
- **Animation**: Physics-based transitions (150-500ms), reduced-motion support

**Scale & Complexity:**
- Primary domain: Web SPA (Mobile-First React Application)
- Complexity level: Medium-High
- Estimated architectural components: 15-20 distinct modules
- Current state: Frontend complete, backend mock, no auth/testing

### Technical Constraints & Dependencies

| Constraint | Impact |
|------------|--------|
| GitHub Spark Platform | Must use @github/spark SDK, useKV hook, Vite plugins |
| Client-Side Only | All business logic in browser, localStorage limits (~5MB) |
| No Backend Currently | Mock data architecture, API integration needed for production |
| React 19 | Automatic JSX transform, concurrent features available |
| TypeScript Strict | Null safety, explicit types, no `any` |

### Cross-Cutting Concerns Identified

1. **State Persistence** - Spark useKV with null-safety patterns across all features
2. **Error Handling** - Error boundary at root, consistent error UI patterns
3. **Form Validation** - Zod schemas with React Hook Form for checkout/onboarding
4. **User Feedback** - Sonner toast system for confirmations and errors
5. **Responsive Design** - Mobile-first Tailwind with sm/md/lg breakpoints
6. **Animation Consistency** - Framer Motion with AnimatePresence patterns
7. **Type Safety** - Discriminated unions, Record types, strict null checks

---

## Starter Template Evaluation

### Primary Technology Domain

**Web SPA (Mobile-First React Application)** - Brownfield project with established tech stack.

### Starter Template Used

**GitHub Spark Template** - GitHub's internal starter for Spark platform applications.

**Initialization (Already Complete):**
```bash
# Project initialized via GitHub Spark Template
# Timestamp: January 2026
```

### Architectural Decisions Established by Starter

**Language & Runtime:**
- TypeScript 5.7.2 with strict mode enabled
- ES2020 target for modern JavaScript features
- Bundler module resolution for ESM imports
- Path aliases: `@/*` → `./src/*`

**Styling Solution:**
- Tailwind CSS 4.1.11 with Vite plugin integration
- Design tokens for colors, typography, spacing
- Mobile-first responsive breakpoints (sm/md/lg)
- class-variance-authority for component variants

**Build Tooling:**
- Vite 7.2.6 with SWC-based React plugin
- Optimized production builds with code splitting
- GitHub Spark plugins (sparkPlugin, createIconImportProxy)

**Component Architecture:**
- Radix UI primitives for accessible interactions
- shadcn/ui pattern for wrapped components
- Single component per file convention
- Props interfaces co-located with components

**State Management:**
- Spark useKV for persistent localStorage state
- React useState for local UI state
- Discriminated unions for screen routing

**Development Experience:**
- Hot Module Replacement via Vite
- ESLint with TypeScript and React Hooks rules
- Error boundary for production error handling

### Brownfield Project Status

This is an existing project with frontend implementation complete. Architecture decisions focus on:
1. Establishing consistency patterns for continued development
2. Planning backend integration architecture
3. Defining testing infrastructure
4. Documenting gaps for production readiness

