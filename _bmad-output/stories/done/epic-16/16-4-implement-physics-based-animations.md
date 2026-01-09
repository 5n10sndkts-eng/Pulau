# Story 16.4: Implement Physics-Based Animations

Status: done

## Story

As a user,
I want smooth, delightful animations,
So that the app feels responsive and premium.

## Acceptance Criteria

### AC1: Animation Configuration
**Given** Framer Motion is configured
**When** animations trigger
**Then** animations use spring physics (not linear timing):
  - Quick Add fly-to-trip: 150ms ease-out
  - Heart pop: 200ms bounce
  - Page transitions: 300ms ease-in-out (slide)
  - Success confetti: 500ms

### AC2: Performance and Accessibility
**And** all animations run at 60fps
**And** AnimatePresence wraps conditional elements for exit animations
**When** user has reduced-motion preference
**Then** animations are disabled (prefers-reduced-motion media query)

## Tasks / Subtasks

### Task 1: Install and Configure Framer Motion (AC: #1)
- [x] Install framer-motion package (npm install framer-motion)
- [x] Create animation configuration file with spring presets
- [x] Define easing curves for different animation types
- [x] Set up global animation duration constants
- [x] Document animation patterns for team reference

### Task 2: Implement Quick Add Fly-to-Trip Animation (AC: #1)
- [x] Create motion component for experience card
- [x] Implement fly-to-cart animation on "Add to Trip" tap
- [x] Animate card from current position to trip builder icon
- [x] Use ease-out curve, 150ms duration
- [x] Shrink and fade card during flight

### Task 3: Implement Heart Pop Animation (AC: #1)
- [x] Create animated heart icon component
- [x] On tap, trigger scale and bounce animation
- [x] Use spring physics with bounce effect (200ms)
- [x] Add subtle rotation for extra delight
- [x] Ensure animation feels snappy and responsive

### Task 4: Implement Page Transitions (AC: #1)
- [x] Wrap page components with AnimatePresence
- [x] Add slide-in/slide-out animations for page changes
- [x] Use 300ms ease-in-out timing
- [x] Direction: right to left for forward, left to right for back
- [x] Ensure previous page exits before new page enters

### Task 5: Implement Success Confetti Animation (AC: #1)
- [x] Create confetti particle system using Framer Motion
- [x] Trigger on successful booking completion
- [x] Animate particles with stagger and randomness
- [x] Duration: 500ms with fade-out
- [x] Ensure confetti doesn't block UI

### Task 6: Optimize Performance (AC: #2)
- [x] Use `will-change` CSS property for animated elements
- [x] Ensure animations use GPU-accelerated properties (transform, opacity)
- [x] Monitor frame rate during animations (target 60fps)
- [x] Avoid animating layout properties (width, height, top, left)
- [x] Test on low-end devices to ensure smooth performance

### Task 7: Implement Reduced Motion Support (AC: #2)
- [x] Detect prefers-reduced-motion media query
- [x] Create hook: useReducedMotion()
- [x] Conditionally disable animations when preference detected
- [x] Replace animations with instant transitions
- [x] Test with bobjectser dev tools accessibility settings

## Dev Notes

### Framer Motion Installation
```bash
npm install framer-motion
```

### Animation Configuration
File: `src/lib/animations.ts`
```typescript
export const springConfig = {
  quickAdd: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    duration: 0.15,
  },
  heartPop: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
    duration: 0.2,
  },
  pageTransition: {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
  },
  confetti: {
    type: 'tween',
    ease: 'easeOut',
    duration: 0.5,
  },
};
```

### Quick Add Animation
```tsx
import { motion } from 'framer-motion';

const ExperienceCard = ({ onAddToTrip }) => {
  const [isFlying, setIsFlying] = useState(false);

  return (
    <motion.div
      animate={isFlying ? {
        x: targetPosition.x,
        y: targetPosition.y,
        scale: 0.2,
        opacity: 0,
      } : {}}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      <button onClick={() => {
        setIsFlying(true);
        setTimeout(() => onAddToTrip(), 150);
      }}>
        Add to Trip
      </button>
    </motion.div>
  );
};
```

### Heart Pop Animation
```tsx
const HeartButton = ({ isLiked, onToggle }) => {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{
        scale: [1, 1.3, 1],
        rotate: [0, 10, -10, 0],
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 10,
      }}
    >
      <Heart fill={isLiked ? 'currentColor' : 'none'} />
    </motion.button>
  );
};
```

### Page Transitions
```tsx
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
};

const App = () => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentScreen.type}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {renderScreen()}
      </motion.div>
    </AnimatePresence>
  );
};
```

### Confetti Animation
```tsx
const Confetti = () => {
  const particles = Array.from({ length: 50 });

  return (
    <div className="fixed inset-0 pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: '50%',
            y: '50%',
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            scale: [0, 1, 0],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.5,
            delay: i * 0.01,
            ease: 'easeOut',
          }}
          className="absolute w-2 h-2 bg-accent rounded-full"
        />
      ))}
    </div>
  );
};
```

### Reduced Motion Hook
```typescript
import { useEffect, useState } from 'react';

export const useReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handler = (e) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
};

// Usage
const Component = () => {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={reducedMotion ? {} : { scale: 1.2 }}
    >
      Content
    </motion.div>
  );
};
```

### Performance Optimization
- Animate only `transform` and `opacity` (GPU-accelerated)
- Avoid: `width`, `height`, `top`, `left`, `margin` (cause reflow)
- Use `layoutId` for shared element transitions
- Add `will-change: transform` CSS for frequently animated elements

### Accessibility
- Respect `prefers-reduced-motion` system preference
- Provide instant transitions when animations disabled
- Ensure critical actions work without animations
- Test with screen readers (animations shouldn't interfere)

## References

- [Source: planning-artifacts/epics/epic-16.md#Epic 16, Story 16.4]
- [Framer Motion Docs](https://www.framer.com/motion/)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Web Animation Performance](https://web.dev/animations/)

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

