# Pulau - Development Guide

## Prerequisites

| Requirement | Version | Notes                 |
| ----------- | ------- | --------------------- |
| Node.js     | 18+     | LTS recommended       |
| npm         | 9+      | Included with Node.js |
| Git         | 2.x     | For version control   |

## Quick Start

```bash
# Clone/navigate to project
cd /Users/moe/Pulau

# Install dependencies
npm install

# Start development server
npm run dev

# Application available at http://localhost:5173
```

## Available Scripts

| Script     | Command            | Description               |
| ---------- | ------------------ | ------------------------- |
| `dev`      | `npm run dev`      | Start Vite dev server     |
| `build`    | `npm run build`    | Build for production      |
| `preview`  | `npm run preview`  | Preview production build  |
| `lint`     | `npm run lint`     | Run ESLint                |
| `optimize` | `npm run optimize` | Optimize dependencies     |
| `kill`     | `npm run kill`     | Kill process on port 5000 |

## Project Structure

```
src/
├── App.tsx              # Main app component
├── main.tsx             # Entry point
├── components/          # React components
│   ├── checkout/        # Checkout flow
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom hooks
├── lib/                 # Utilities & data
└── styles/              # CSS files
```

## Development Workflow

### 1. Adding a New Screen

1. Create component in `src/components/`:

```typescript
// src/components/NewScreen.tsx
interface NewScreenProps {
  onBack: () => void
}

export function NewScreen({ onBack }: NewScreenProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      {/* Content */}
    </div>
  )
}
```

2. Add screen type to `App.tsx`:

```typescript
type Screen = { type: 'newscreen' };
// ... other screens
```

3. Add render case in `App.tsx`:

```typescript
if (currentScreen.type === 'newscreen') {
  return <NewScreen onBack={() => setCurrentScreen({ type: 'home' })} />
}
```

### 2. Adding a UI Component

Using shadcn/ui CLI (if available):

```bash
npx shadcn@latest add [component-name]
```

Manual addition:

1. Create file in `src/components/ui/`
2. Follow shadcn/ui patterns
3. Use Radix primitives as needed

### 3. Adding State

```typescript
// In App.tsx
const [newState, setNewState] = useKV<StateType>('key', defaultValue);
```

### 4. Adding Helper Functions

Add to `src/lib/helpers.ts`:

```typescript
export function myHelper(param: ParamType): ReturnType {
  // Implementation
}
```

## Code Style

### TypeScript

- Use strict mode
- Prefer interfaces over types for objects
- Use discriminated unions for state

### React

- Functional components only
- Use hooks for state and effects
- Prefer composition over inheritance

### Styling

- Use Tailwind CSS utilities
- Follow mobile-first approach
- Use CSS variables for theming

### File Naming

| Type       | Convention           | Example          |
| ---------- | -------------------- | ---------------- |
| Components | PascalCase           | `HomeScreen.tsx` |
| Hooks      | camelCase with `use` | `use-mobile.ts`  |
| Utilities  | camelCase            | `helpers.ts`     |
| Types      | camelCase            | `types.ts`       |

## Adding Dependencies

```bash
# Production dependency
npm install [package]

# Development dependency
npm install -D [package]
```

### Common Packages Already Included

- **UI**: Radix UI primitives, Lucide icons
- **Animation**: Framer Motion
- **Forms**: React Hook Form, Zod
- **Date**: date-fns, react-day-picker
- **Utils**: clsx, tailwind-merge

## Testing

Currently no test framework is configured. Recommendations:

- **Unit Tests**: Vitest
- **Component Tests**: Testing Library
- **E2E Tests**: Playwright or Cypress

## Building for Production

```bash
# Build
npm run build

# Preview locally
npm run preview
```

Output in `dist/`:

- `index.html`
- `assets/index-[hash].js` (~697KB)
- `assets/index-[hash].css` (~376KB)

## Environment Configuration

### GitHub Spark

The application uses GitHub Spark hooks:

```typescript
import { useKV } from '@github/spark/hooks';
```

In development without Spark auth, KV returns 403 - app falls back to defaults.

### Path Aliases

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

## Troubleshooting

### Common Issues

| Issue              | Solution                                |
| ------------------ | --------------------------------------- |
| Port in use        | Run `npm run kill` or change port       |
| KV 403 errors      | Expected in local dev without Spark     |
| Images not loading | CSP blocks external images in some envs |
| Build fails        | Check TypeScript errors with `tsc`      |

### Debug Tips

1. Check browser console for errors
2. Verify KV state in React DevTools
3. Use Vite's HMR for fast iteration

## IDE Setup

### VS Code Extensions

- ESLint
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- Prettier (optional)

### Settings

Already configured in `.vscode/` (if present).

---

_Generated by BMAD Document Project Workflow v1.2.0_
