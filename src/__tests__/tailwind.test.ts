/**
 * Tailwind CSS Design System Tests
 * Validates Bali-inspired design tokens and configuration
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Tailwind CSS Configuration', () => {
  let tailwindConfig: string

  beforeAll(() => {
    tailwindConfig = readFileSync(
      resolve(__dirname, '../../tailwind.config.js'),
      'utf-8'
    )
  })

  it('should have Bali-inspired primary color (Deep Teal)', () => {
    expect(tailwindConfig).toContain('oklch(0.48 0.09 210)')
    expect(tailwindConfig).toContain('Deep Teal')
  })

  it('should have Warm Coral secondary color', () => {
    expect(tailwindConfig).toContain('oklch(0.68 0.17 25)')
    expect(tailwindConfig).toContain('Warm Coral')
    expect(tailwindConfig).toContain('coral:')
  })

  it('should have Golden Sand secondary color for highlights', () => {
    expect(tailwindConfig).toContain('oklch(0.87 0.12 85)')
    expect(tailwindConfig).toContain('Golden Sand')
    expect(tailwindConfig).toContain('sand:')
  })

  it('should have Soft Green success color', () => {
    expect(tailwindConfig).toContain('oklch(0.65 0.14 155)')
    expect(tailwindConfig).toContain('Soft Green')
  })

  it('should have mobile-first breakpoints configured', () => {
    expect(tailwindConfig).toContain('sm: "640px"')
    expect(tailwindConfig).toContain('md: "768px"')
    expect(tailwindConfig).toContain('lg: "1024px"')
  })

  it('should have custom border radius tokens', () => {
    expect(tailwindConfig).toContain('card: "12px"')
    expect(tailwindConfig).toContain('button: "8px"')
    expect(tailwindConfig).toContain('pill: "24px"')
  })

  it('should have Plus Jakarta Sans display font', () => {
    expect(tailwindConfig).toContain('Plus Jakarta Sans')
    expect(tailwindConfig).toContain('display:')
  })

  it('should have Inter body font', () => {
    expect(tailwindConfig).toContain('Inter')
    expect(tailwindConfig).toContain('sans:')
  })

  it('should have Caveat accent font for special callouts', () => {
    expect(tailwindConfig).toContain('Caveat')
    expect(tailwindConfig).toContain('accent:')
  })
})

describe('Font Loading', () => {
  it('should have Google Fonts preconnect in index.html', () => {
    const indexHtml = readFileSync(
      resolve(__dirname, '../../index.html'),
      'utf-8'
    )
    expect(indexHtml).toContain('fonts.googleapis.com')
    expect(indexHtml).toContain('fonts.gstatic.com')
  })

  it('should load Plus Jakarta Sans and Inter fonts', () => {
    const indexHtml = readFileSync(
      resolve(__dirname, '../../index.html'),
      'utf-8'
    )
    expect(indexHtml).toContain('Plus+Jakarta+Sans')
    expect(indexHtml).toContain('Inter')
  })
})

describe('Spacing System', () => {
  it('should use 4px base unit (var CSS variables)', () => {
    const tailwindConfig = readFileSync(
      resolve(__dirname, '../../tailwind.config.js'),
      'utf-8'
    )
    expect(tailwindConfig).toContain('var(--size-')
  })
})
