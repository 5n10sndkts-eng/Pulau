# Story 18.1: Implement Discriminated Union Screen Routing

Status: ready-for-dev

## Story

As a developer,
I want type-safe screen routing,
So that navigation is predictable and bug-free.

## Acceptance Criteria

### AC1: Screen Type Definition
**Given** the app uses state-based routing (no react-router)
**When** Screen type is defined
**Then** discriminated union covers all screens:
```typescript
type Screen =
  | { type: 'home' }
  | { type: 'category'; categoryId: string }
  | { type: 'experience'; experienceId: string }
  | { type: 'tripBuilder' }
  | { type: 'checkout'; step: 1 | 2 | 3 | 4 }
  | { type: 'explore' }
  | { type: 'saved' }
  | { type: 'profile' }
  | { type: 'bookingHistory' }
  | { type: 'bookingDetail'; bookingId: string }
  | { type: 'settings'; section: string }
```

### AC2: Type-Safe Rendering
**And** App.tsx switches on screen.type to render correct component
**And** TypeScript ensures exhaustive handling
**And** invalid screens cause compile-time error

## Tasks / Subtasks

### Task 1: Define Screen Discriminated Union Type (AC: #1)
- [ ] Create Screen type with all possible screen variants
- [ ] Use discriminated union pattern with 'type' property
- [ ] Add necessary parameters for each screen (IDs, steps, etc.)
- [ ] Export Screen type from types file
- [ ] Document each screen variant with JSDoc comments

### Task 2: Create Navigation State Management (AC: #1)
- [ ] Set up global navigation state (React Context or Zustand)
- [ ] Create navigate function that accepts Screen type
- [ ] Implement navigation history stack
- [ ] Add goBack function to pop from history
- [ ] Ensure type safety for all navigation calls

### Task 3: Implement Screen Renderer with Exhaustive Checking (AC: #2)
- [ ] Build switch statement in App.tsx on screen.type
- [ ] Render appropriate component for each screen type
- [ ] Add TypeScript exhaustiveness checking (never type)
- [ ] Handle unknown screen types gracefully (404 fallback)
- [ ] Test that all screen variants compile correctly

### Task 4: Create Type-Safe Navigation Helpers (AC: #2)
- [ ] Build navigateTo helper functions for common screens
- [ ] Add type guards for screen type checking
- [ ] Create hooks: useCurrentScreen, useNavigate
- [ ] Ensure all navigation calls are type-safe
- [ ] Document navigation API for team

### Task 5: Test Type Safety and Error Handling (AC: #2)
- [ ] Verify invalid screen types cause TypeScript errors
- [ ] Test navigation with missing required parameters
- [ ] Ensure exhaustive switch handling catches all cases
- [ ] Add runtime validation for screen state
- [ ] Test navigation history and back navigation

## Dev Notes

### Screen Type Definition
File: `src/types/navigation.ts`
```typescript
export type Screen =
  | { type: 'home' }
  | { type: 'category'; categoryId: string }
  | { type: 'experience'; experienceId: string }
  | { type: 'tripBuilder' }
  | { type: 'checkout'; step: 1 | 2 | 3 | 4 }
  | { type: 'explore' }
  | { type: 'saved' }
  | { type: 'profile' }
  | { type: 'bookingHistory' }
  | { type: 'bookingDetail'; bookingId: string }
  | { type: 'settings'; section: string }
  | { type: 'messages' }
  | { type: 'conversation'; conversationId: string };
```

### Navigation Context
```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  currentScreen: Screen;
  history: Screen[];
  navigate: (screen: Screen) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'home' });
  const [history, setHistory] = useState<Screen[]>([{ type: 'home' }]);

  const navigate = (screen: Screen) => {
    setHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCurrentScreen(newHistory[newHistory.length - 1]);
    }
  };

  const canGoBack = history.length > 1;

  return (
    <NavigationContext.Provider value={{ currentScreen, history, navigate, goBack, canGoBack }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within NavigationProvider');
  return context;
};
```

### App Renderer with Exhaustive Checking
```typescript
import { useNavigation } from './hooks/useNavigation';

function App() {
  const { currentScreen } = useNavigation();

  const renderScreen = (): JSX.Element => {
    switch (currentScreen.type) {
      case 'home':
        return <HomeScreen />;
      case 'category':
        return <CategoryScreen categoryId={currentScreen.categoryId} />;
      case 'experience':
        return <ExperienceDetailScreen experienceId={currentScreen.experienceId} />;
      case 'tripBuilder':
        return <TripBuilderScreen />;
      case 'checkout':
        return <CheckoutScreen step={currentScreen.step} />;
      case 'explore':
        return <ExploreScreen />;
      case 'saved':
        return <SavedScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'bookingHistory':
        return <BookingHistoryScreen />;
      case 'bookingDetail':
        return <BookingDetailScreen bookingId={currentScreen.bookingId} />;
      case 'settings':
        return <SettingsScreen section={currentScreen.section} />;
      case 'messages':
        return <MessagesScreen />;
      case 'conversation':
        return <ConversationScreen conversationId={currentScreen.conversationId} />;
      default:
        // TypeScript exhaustiveness check
        const _exhaustiveCheck: never = currentScreen;
        return <NotFoundScreen />;
    }
  };

  return (
    <div className="app">
      {renderScreen()}
      <BottomNavigation />
    </div>
  );
}
```

### Navigation Helper Functions
```typescript
export const navigateToCategory = (navigate: (screen: Screen) => void, categoryId: string) => {
  navigate({ type: 'category', categoryId });
};

export const navigateToExperience = (navigate: (screen: Screen) => void, experienceId: string) => {
  navigate({ type: 'experience', experienceId });
};

export const navigateToCheckout = (navigate: (screen: Screen) => void, step: 1 | 2 | 3 | 4 = 1) => {
  navigate({ type: 'checkout', step });
};

// Type guard
export const isDetailScreen = (screen: Screen): screen is Extract<Screen, { type: 'experience' | 'bookingDetail' }> => {
  return screen.type === 'experience' || screen.type === 'bookingDetail';
};
```

### Usage Example
```tsx
const CategoryCard = ({ category }: { category: Category }) => {
  const { navigate } = useNavigation();

  return (
    <button onClick={() => navigate({ type: 'category', categoryId: category.id })}>
      {category.name}
    </button>
  );
};
```

### Benefits of Discriminated Union Routing
- **Type Safety**: TypeScript enforces valid screen types and parameters
- **Exhaustive Checking**: Compiler ensures all screens are handled
- **Predictable**: No string-based routes that can break silently
- **Refactor-Friendly**: Renaming screen types updates all references
- **No Dependencies**: No need for react-router or similar library

### Testing Type Safety
```typescript
// ✓ Valid navigation (compiles)
navigate({ type: 'experience', experienceId: '123' });

// ✗ Invalid navigation (TypeScript error)
navigate({ type: 'experience' }); // Error: missing experienceId

// ✗ Unknown screen type (TypeScript error)
navigate({ type: 'unknown' }); // Error: type 'unknown' not in Screen union
```

## References

- [Source: epics.md#Epic 18, Story 18.1]
- [TypeScript: Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
- [Pattern: State-Based Routing](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
