### Story 1.2: Configure Tailwind CSS Design System

As a developer,
I want Tailwind CSS 4.1.11 configured with the Bali-inspired design tokens,
So that all UI components follow the consistent design system.

**Acceptance Criteria:**

**Given** the initialized project from Story 1.1
**When** Tailwind CSS is configured with Vite plugin
**Then** tailwind.config.js includes custom color palette (Deep Teal #0D7377, Warm Coral #FF6B6B, Golden Sand #F4D03F, Success #27AE60)
**And** custom fonts are configured (Plus Jakarta Sans, Inter)
**And** mobile-first breakpoints are set (sm: 640px, md: 768px, lg: 1024px)
**And** spacing system with 4px base unit is configured
**And** border radius tokens (12-16px cards, 8px buttons, 24px pills) are defined
**And** a test component renders with Tailwind classes successfully
