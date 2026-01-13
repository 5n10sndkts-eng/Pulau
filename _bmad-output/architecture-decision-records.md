# Architecture Decision Records (ADRs) - Pulau Project

**Purpose**: Document key architectural decisions made during Pulau development

**Format**: Each ADR follows the format: Context, Decision, Rationale, Consequences, Status

---

## ADR-001: Use React Web Instead of React Native

**Date**: 2026-01-05 (Implementation)  
**Status**: ✅ Accepted and Implemented  
**Decided By**: Development Team

### Context

The initial project planning and story templates were created for a React Native mobile application. However, the actual implementation needed to work with GitHub Spark SDK, which is designed for web applications.

### Decision

Build Pulau as a **React Web application** instead of React Native mobile app.

**Technology Stack**:

- React 19 (web)
- Vite 6.0.5 (build tool)
- TypeScript 5.7.2
- Modern browser targets (Chrome, Firefox, Safari, Edge)

### Rationale

**Why React Web?**

1. **GitHub Spark Compatibility**: Spark SDK is web-only, not available for React Native
2. **Faster Deployment**: Web apps deploy instantly, no app store approval process
3. **Broader Reach**: Works on any device with a browser, no installation required
4. **Rapid Prototyping**: Easier iteration and testing during MVP phase
5. **Development Velocity**: Familiar web tooling and debugging

**Why Not React Native?**

1. GitHub Spark SDK not compatible with React Native
2. Would require building separate backend API
3. Longer development cycle (iOS + Android + testing)
4. App store submission delays
5. More complex deployment and updates

### Consequences

**Positive**:

- ✅ Fast development and deployment
- ✅ Instant updates (no app store review)
- ✅ Works across all platforms without separate builds
- ✅ Simpler tech stack (no native bridge complexity)
- ✅ Better integration with GitHub Spark ecosystem

**Negative**:

- ❌ No access to native device features (camera, push notifications, etc.)
- ❌ Requires internet connection (limited offline capabilities)
- ❌ Performance may be lower than native for complex animations
- ❌ Can't distribute through app stores
- ❌ No native app "feel" (e.g., no pull-to-refresh, native gestures)

**Mitigation**:

- Progressive Web App (PWA) can provide some native-like features
- Service workers can enable limited offline functionality
- Web APIs provide sufficient functionality for booking use case

### Alternatives Considered

**Option 1: React Native**

- **Pros**: Native performance, app store presence, device API access
- **Cons**: Incompatible with GitHub Spark, slower development, complex deployment
- **Verdict**: ❌ Rejected due to GitHub Spark incompatibility

**Option 2: Next.js (React + SSR)**

- **Pros**: Better SEO, server-side rendering, routing built-in
- **Cons**: More complex than needed for MVP, Spark SDK works with SPA
- **Verdict**: ❌ Not needed for initial MVP, can migrate later

**Option 3: React Web (SPA)**

- **Pros**: Simple, fast, compatible with Spark, rapid development
- **Cons**: Limited native features, requires internet
- **Verdict**: ✅ **Selected** - Best fit for MVP with GitHub Spark

### Status Updates

- **2026-01-05**: Implemented as React Web application
- **2026-01-06**: Documented in adversarial code review (68 template errors corrected)

---

## ADR-002: Use GitHub Spark KV Store Instead of Supabase

**Date**: 2026-01-05 (Implementation)  
**Status**: ✅ Accepted and Implemented  
**Decided By**: Development Team

### Context

Initial story templates assumed Supabase PostgreSQL database with complex queries, joins, and real-time subscriptions. The GitHub Spark platform provides a built-in KV (Key-Value) store.

### Decision

Use **GitHub Spark KV store** for all data persistence instead of external database.

**Data Structure**:

- Trips: `pulau_trips` KV key → Trip[] array
- Bookings: `pulau_bookings` KV key → Booking[] array
- All related data embedded in objects (no separate tables/joins)

### Rationale

**Why KV Store?**

1. **Native Integration**: Built into GitHub Spark SDK, zero configuration
2. **Simplicity**: No database schema, migrations, or connection management
3. **Prototyping Speed**: Instant data persistence without backend setup
4. **Demo-Friendly**: Easy to reset and populate with sample data
5. **Zero Cost**: Included with GitHub Spark, no database hosting fees

**Why Not Supabase?**

1. Requires separate authentication and API setup
2. Adds external dependency and complexity
3. Overkill for MVP data volumes
4. Slower iteration during prototyping phase
5. Additional cost and maintenance burden

### Consequences

**Positive**:

- ✅ Zero configuration data persistence
- ✅ No database schema to maintain
- ✅ Simple client-side filtering and sorting
- ✅ Easy to inspect and modify data during development
- ✅ No backend API needed

**Negative**:

- ❌ All data loaded into memory (not suitable for large datasets)
- ❌ No real-time sync across devices (must refresh)
- ❌ Client-side filtering less performant than SQL
- ❌ No complex queries (joins, aggregations, etc.)
- ❌ Limited by browser memory constraints

**Acceptable Trade-offs for MVP**:

- MVP data volumes fit comfortably in memory
- User sessions are typically single-device
- Client-side filtering is instant for <1000 items
- Simple data structure matches MVP requirements

### Data Access Patterns

**Reading Data**:

```typescript
const [trips, setTrips] = useKV<Trip[]>('pulau_trips', []);
const [bookings, setBookings] = useKV<Booking[]>('pulau_bookings', []);
```

**Filtering (Client-Side)**:

```typescript
const upcoming = bookings.filter(
  (b) => b.status === 'confirmed' && new Date(b.trip.startDate) >= new Date(),
);
```

**Updating Data**:

```typescript
setBookings([...bookings, newBooking]); // Immutable append
```

### Alternatives Considered

**Option 1: Supabase PostgreSQL**

- **Pros**: Powerful queries, real-time sync, scalable, auth included
- **Cons**: External dependency, complex setup, slower development
- **Verdict**: ❌ Too complex for MVP, can migrate later if needed

**Option 2: Firebase Firestore**

- **Pros**: Real-time, scalable, good for prototyping
- **Cons**: Another external dependency, vendor lock-in, cost
- **Verdict**: ❌ Not needed when KV store suffices

**Option 3: LocalStorage Only**

- **Pros**: Simple, built-in browser API
- **Cons**: Not shared across devices/sessions, limited to 5-10MB
- **Verdict**: ❌ Too limited, no cross-device persistence

**Option 4: GitHub Spark KV Store**

- **Pros**: Native, zero config, perfect for MVP, easy to demo
- **Cons**: Not suitable for production scale
- **Verdict**: ✅ **Selected** - Ideal for MVP and prototyping

### Migration Path

When scaling beyond MVP:

1. Export data from KV store to structured format
2. Migrate to Supabase/PostgreSQL or Firebase
3. Refactor `useKV` calls to API endpoints
4. Add server-side filtering and pagination
5. Implement real-time subscriptions if needed

**KV Store Sufficient For**:

- Up to ~500 bookings per user
- Up to ~1000 trip items total
- MVP and demo deployments
- Development and testing

**Migration Trigger**: When any limit is approached or real-time sync required

### Status Updates

- **2026-01-05**: Implemented with KV store
- **2026-01-06**: Documented in ADRs after code review revealed template mismatch

---

## ADR-003: Use Tailwind CSS 4 Alpha Instead of Stable v3

**Date**: 2026-01-05 (Implementation)  
**Status**: ✅ Accepted and Implemented  
**Decided By**: Development Team

### Context

Tailwind CSS v4 is in alpha but offers significant architectural improvements over v3. The project could use stable v3 or adopt early v4 alpha.

### Decision

Use **Tailwind CSS 4.0.0-alpha.37** for styling.

**Key Changes from v3**:

- CSS-first approach (no JIT compiler)
- Native CSS cascade layers
- Improved performance
- Cleaner output CSS

### Rationale

**Why v4 Alpha?**

1. **Future-Proof**: v4 will be stable soon, better to start with modern architecture
2. **Performance**: No JIT compilation overhead, faster builds
3. **CSS-First**: Aligns with web standards, better for learning
4. **Clean Output**: More maintainable generated CSS
5. **Learning Opportunity**: Early adoption experience valuable

**Why Not v3 Stable?**

1. Will require migration to v4 eventually
2. JIT compiler adds build complexity
3. Less aligned with modern CSS standards
4. Migration effort later vs. learning now

### Consequences

**Positive**:

- ✅ Modern CSS architecture from day one
- ✅ Faster build times (no JIT)
- ✅ Cleaner CSS output for debugging
- ✅ No future migration needed

**Negative**:

- ⚠️ Alpha software may have bugs
- ⚠️ Breaking changes possible before stable
- ⚠️ Less community resources/examples
- ⚠️ Some v3 plugins may not work

**Mitigations**:

- Lock to specific alpha version in package.json
- Monitor v4 release notes for breaking changes
- Use only core Tailwind features (avoid experimental)
- Document any workarounds needed

### Issues Encountered

1. **Color Naming Conflicts** (Fixed in Story 1-2)
   - v4 requires `oklch()` syntax for custom colors
   - Fixed: Updated color definitions in `tailwind.config.ts`

2. **@tailwind Directive Changes**
   - v4 uses `@import "tailwindcss"` instead of directives
   - Fixed: Updated CSS imports

### Alternatives Considered

**Option 1: Tailwind CSS v3 Stable**

- **Pros**: Stable, lots of examples, community support
- **Cons**: Will need migration later, JIT complexity
- **Verdict**: ❌ Migration effort deferred is tech debt

**Option 2: Vanilla CSS**

- **Pros**: No dependencies, full control
- **Cons**: Much slower development, manual responsive design
- **Verdict**: ❌ Too slow for MVP timeline

**Option 3: Tailwind v4 Alpha**

- **Pros**: Modern, future-proof, better performance
- **Cons**: Alpha stability risk
- **Verdict**: ✅ **Selected** - Risk acceptable for MVP, future-proof

### Status Updates

- **2026-01-05**: Implemented with v4 alpha
- **2026-01-06**: Minor color syntax issues resolved

---

## ADR-004: Use Lucide React Instead of Phosphor Icons

**Date**: 2026-01-05 (Implementation)  
**Status**: ✅ Accepted and Implemented  
**Decided By**: Development Team  
**Updated PRD**: 2026-01-06

### Context

PRD originally specified Phosphor icon library. During implementation, Lucide React was used instead. Both provide similar icon sets with React components.

### Decision

Use **Lucide React** for all icons instead of Phosphor.

**Icon Library**: `lucide-react` npm package  
**Icon Style**: Rounded stroke icons, 24px default size  
**Customization**: Stroke width, size, and color via props

### Rationale

**Why Lucide React?**

1. **Better React Integration**: First-class React support with TypeScript
2. **Tree-Shaking**: Only imports icons actually used
3. **Smaller Bundle**: More efficient code splitting
4. **Active Maintenance**: Strong community, frequent updates
5. **Similar Visual Style**: Rounded stroke icons match Phosphor aesthetic

**Why Not Phosphor?**

1. Less optimal React integration
2. Larger bundle size impact
3. Less active TypeScript support

### Consequences

**Positive**:

- ✅ Smaller bundle size (tree-shaking)
- ✅ Better TypeScript types
- ✅ Excellent React integration
- ✅ Active development community

**Negative**:

- ⚠️ PRD update needed (done 2026-01-06)
- ⚠️ Icon naming differs slightly from Phosphor

**Icon Mapping** (Phosphor → Lucide):

- `PhosphorIcon` → `LucideIcon`
- `User` → `User` (same)
- `MapPin` → `MapPin` (same)
- Most icons have identical names

### Implementation Notes

**Type Declaration** (Added):

```typescript
// src/lucide-react.d.ts
declare module 'lucide-react' {
  import { SVGProps } from 'react';
  export type LucideIcon = React.FC<SVGProps<SVGSVGElement>>;
  export const Check: LucideIcon;
  export const MapPin: LucideIcon;
  // ... etc
}
```

**Usage Pattern**:

```typescript
import { Check, MapPin } from 'lucide-react';

<Check className="w-4 h-4" />
<MapPin className="w-5 h-5 text-primary" />
```

### Status Updates

- **2026-01-05**: Implemented with Lucide React
- **2026-01-06**: PRD updated to reflect actual implementation (Story 1-4)

---

## ADR Template (For Future Decisions)

**Date**: YYYY-MM-DD  
**Status**: 🔄 Proposed / ✅ Accepted / ❌ Rejected / 📦 Superseded  
**Decided By**: [Team/Individual]

### Context

[What situation led to this decision? What problem are we solving?]

### Decision

[What did we decide to do? Be specific and concrete.]

### Rationale

[Why did we make this decision? What factors influenced it?]

### Consequences

**Positive**:

- Benefits we gain

**Negative**:

- Trade-offs we accept

**Mitigations**:

- How we address downsides

### Alternatives Considered

**Option 1**: [Description]

- Pros: [List]
- Cons: [List]
- Verdict: [Why rejected/accepted]

### Status Updates

- **YYYY-MM-DD**: [Status change or implementation note]

---

**ADR Index**:

- ADR-001: React Web vs React Native
- ADR-002: GitHub Spark KV Store vs Supabase
- ADR-003: Tailwind CSS v4 Alpha vs v3 Stable
- ADR-004: Lucide React vs Phosphor Icons

**Next ADR Number**: ADR-005

**Maintainer**: Dev Team  
**Last Updated**: January 6, 2026
