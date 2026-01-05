/**
 * Animation and Icon System Tests
 * Validates Framer Motion and Phosphor icons configuration
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Framer Motion Configuration', () => {
  it('should have framer-motion installed', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(__dirname, '../../package.json'), 'utf-8')
    )
    expect(packageJson.dependencies['framer-motion']).toBe('^12.23.26')
  })

  it('should have motion components file', () => {
    const motionFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/motion.tsx'),
      'utf-8'
    )
    expect(motionFile).toContain('framer-motion')
    expect(motionFile).toContain('MotionButton')
    expect(motionFile).toContain('MotionWrapper')
  })

  it('should have animation variants configured', () => {
    const motionFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/motion.tsx'),
      'utf-8'
    )
    expect(motionFile).toContain('quickAddVariants')
    expect(motionFile).toContain('heartPopVariants')
    expect(motionFile).toContain('pageTransitionVariants')
  })

  it('should have spring physics configured', () => {
    const motionFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/motion.tsx'),
      'utf-8'
    )
    expect(motionFile).toContain('stiffness: 400')
    expect(motionFile).toContain('damping: 17')
  })

  it('should have correct animation timings from PRD', () => {
    const motionFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/motion.tsx'),
      'utf-8'
    )
    expect(motionFile).toContain('0.15') // Quick Add 150ms
    expect(motionFile).toContain('0.2') // Heart pop 200ms
    expect(motionFile).toContain('0.3') // Page transition 300ms
  })
})

describe('Reduced Motion Support', () => {
  it('should have useReducedMotion hook', () => {
    const hookFile = readFileSync(
      resolve(__dirname, '../../src/hooks/use-reduced-motion.ts'),
      'utf-8'
    )
    expect(hookFile).toContain('useReducedMotion')
    expect(hookFile).toContain('prefers-reduced-motion')
  })

  it('should respect reduced motion preference', () => {
    const motionFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/motion.tsx'),
      'utf-8'
    )
    expect(motionFile).toContain('useReducedMotion')
    expect(motionFile).toContain('prefersReducedMotion')
    expect(motionFile).toContain('MotionConfig')
  })
})

describe('Phosphor Icons Configuration', () => {
  it('should have @phosphor-icons/react installed', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(__dirname, '../../package.json'), 'utf-8')
    )
    expect(packageJson.dependencies['@phosphor-icons/react']).toBe('^2.1.7')
  })

  it('should have Phosphor icon proxy configured in Vite', () => {
    const viteConfig = readFileSync(
      resolve(__dirname, '../../vite.config.ts'),
      'utf-8'
    )
    expect(viteConfig).toContain('vitePhosphorIconProxyPlugin')
    expect(viteConfig).toContain('createIconImportProxy')
  })
})

describe('Sonner Toast Configuration', () => {
  it('should have sonner installed', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(__dirname, '../../package.json'), 'utf-8')
    )
    expect(packageJson.dependencies['sonner']).toBe('^2.0.1')
  })

  it('should have Toaster in App.tsx', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8'
    )
    expect(appFile).toContain('Toaster')
    expect(appFile).toContain('sonner')
  })
})
