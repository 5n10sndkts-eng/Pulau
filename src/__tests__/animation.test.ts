/**
 * Animation and Icon System Tests
 * Validates Framer Motion and Lucide React icons configuration
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Framer Motion Configuration', () => {
  it('should have framer-motion installed', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'),
    );
    expect(packageJson.dependencies['framer-motion']).toBe('^12.23.26');
  });

  it('should have motion components file', () => {
    const motionFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/motion.tsx'),
      'utf-8',
    );
    expect(motionFile).toContain('framer-motion');
    expect(motionFile).toContain('MotionButton');
    expect(motionFile).toContain('MotionWrapper');
  });

  it('should have animation variants configured', () => {
    const motionVariantsFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/motion.variants.ts'),
      'utf-8',
    );
    expect(motionVariantsFile).toContain('quickAddVariants');
    expect(motionVariantsFile).toContain('heartPopVariants');
    expect(motionVariantsFile).toContain('pageTransitionVariants');
  });

  it('should have spring physics configured', () => {
    const motionVariantsFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/motion.variants.ts'),
      'utf-8',
    );
    expect(motionVariantsFile).toContain('stiffness: 400');
    expect(motionVariantsFile).toContain('damping: 25');
  });

  it('should have correct animation timings from PRD', () => {
    const motionVariantsFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/motion.variants.ts'),
      'utf-8',
    );
    expect(motionVariantsFile).toContain('0.15');
    expect(motionVariantsFile).toContain('0.2');
    expect(motionVariantsFile).toContain('0.3');
  });
});

describe('Reduced Motion Support', () => {
  it('should have useReducedMotion hook', () => {
    const hookFile = readFileSync(
      resolve(__dirname, '../../src/hooks/use-reduced-motion.ts'),
      'utf-8',
    );
    expect(hookFile).toContain('useReducedMotion');
    expect(hookFile).toContain('prefers-reduced-motion');
  });

  it('should respect reduced motion preference', () => {
    const motionFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/motion.tsx'),
      'utf-8',
    );
    expect(motionFile).toContain('useReducedMotion');
    expect(motionFile).toContain('prefersReducedMotion');
    expect(motionFile).toContain('MotionConfig');
  });
});

describe('Icon System Configuration', () => {
  it('should have lucide-react installed', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'),
    );
    expect(packageJson.dependencies['lucide-react']).toBeDefined();
    expect(packageJson.dependencies['lucide-react']).toContain('^0.5');
  });

  it('should use Lucide icons in components', () => {
    // Check HomeScreen at actual location
    const homeFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/HomeScreen.tsx'),
      'utf-8',
    );
    expect(homeFile).toContain('lucide-react');

    // Check ExperienceDetail at actual location
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/features/discovery/ExperienceDetail.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('lucide-react');
  });
});

describe('Toast Notifications', () => {
  it('should have sonner installed', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'),
    );
    expect(packageJson.dependencies.sonner).toBeDefined();
  });

  it('should have Toaster in App.tsx', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8',
    );
    expect(appFile).toContain('Toaster');
    expect(appFile).toContain('sonner');
  });
});
