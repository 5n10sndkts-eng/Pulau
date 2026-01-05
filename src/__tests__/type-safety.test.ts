/**
 * TypeScript Type Safety Pattern Tests
 * Validates strict mode configuration and type patterns
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { Screen } from '@/lib/types'
import { isDefined, filterDefined } from '@/lib/null-safety'

describe('TypeScript Strict Mode Configuration', () => {
  it('should have strict mode enabled', () => {
    const tsconfig = readFileSync(
      resolve(__dirname, '../../tsconfig.json'),
      'utf-8'
    )
    // Remove comments before parsing
    const tsconfigWithoutComments = tsconfig.replace(/\/\*[\s\S]*?\*\//g, '')
    const config = JSON.parse(tsconfigWithoutComments)
    
    expect(config.compilerOptions.strict).toBe(true)
  })

  it('should have strictNullChecks enabled', () => {
    const tsconfig = readFileSync(
      resolve(__dirname, '../../tsconfig.json'),
      'utf-8'
    )
    const tsconfigWithoutComments = tsconfig.replace(/\/\*[\s\S]*?\*\//g, '')
    const config = JSON.parse(tsconfigWithoutComments)
    
    expect(config.compilerOptions.strictNullChecks).toBe(true)
  })

  it('should have noImplicitAny enabled', () => {
    const tsconfig = readFileSync(
      resolve(__dirname, '../../tsconfig.json'),
      'utf-8'
    )
    const tsconfigWithoutComments = tsconfig.replace(/\/\*[\s\S]*?\*\//g, '')
    const config = JSON.parse(tsconfigWithoutComments)
    
    expect(config.compilerOptions.noImplicitAny).toBe(true)
  })

  it('should have noUncheckedIndexedAccess enabled', () => {
    const tsconfig = readFileSync(
      resolve(__dirname, '../../tsconfig.json'),
      'utf-8'
    )
    const tsconfigWithoutComments = tsconfig.replace(/\/\*[\s\S]*?\*\//g, '')
    const config = JSON.parse(tsconfigWithoutComments)
    
    expect(config.compilerOptions.noUncheckedIndexedAccess).toBe(true)
  })

  it('should not use exactOptionalPropertyTypes (too strict for existing codebase)', () => {
    const tsconfig = readFileSync(
      resolve(__dirname, '../../tsconfig.json'),
      'utf-8'
    )
    const tsconfigWithoutComments = tsconfig.replace(/\/\*[\s\S]*?\*\//g, '')
    const config = JSON.parse(tsconfigWithoutComments)
    
    // exactOptionalPropertyTypes is intentionally disabled - it's too strict
    // and causes type errors in existing Radix UI components
    expect(config.compilerOptions.exactOptionalPropertyTypes).toBeUndefined()
  })
})

describe('Discriminated Union Types', () => {
  it('should have Screen discriminated union type', () => {
    const typesFile = readFileSync(
      resolve(__dirname, '../../src/lib/types.ts'),
      'utf-8'
    )
    expect(typesFile).toContain('export type Screen =')
    expect(typesFile).toContain("type: 'home'")
    expect(typesFile).toContain("type: 'category'")
    expect(typesFile).toContain("type: 'experience'")
  })

  it('should document exhaustive switch pattern', () => {
    const typesFile = readFileSync(
      resolve(__dirname, '../../src/lib/types.ts'),
      'utf-8'
    )
    expect(typesFile).toContain('Exhaustive Switch')
    expect(typesFile).toContain('never')
  })

  it('should type-check Screen union correctly', () => {
    const homeScreen: Screen = { type: 'home' }
    const categoryScreen: Screen = { type: 'category', categoryId: 'water' }
    const experienceScreen: Screen = { type: 'experience', experienceId: 'exp-1' }
    
    expect(homeScreen.type).toBe('home')
    expect(categoryScreen.type).toBe('category')
    expect(experienceScreen.type).toBe('experience')
  })
})

describe('Record Type Patterns', () => {
  it('should have Record type definitions', () => {
    const typesFile = readFileSync(
      resolve(__dirname, '../../src/lib/types.ts'),
      'utf-8'
    )
    expect(typesFile).toContain('export type CategoryMap')
    expect(typesFile).toContain('Record<string, Category>')
    expect(typesFile).toContain('export type ExperienceMap')
    expect(typesFile).toContain('Record<string, Experience>')
  })

  it('should document Record usage patterns', () => {
    const typesFile = readFileSync(
      resolve(__dirname, '../../src/lib/types.ts'),
      'utf-8'
    )
    expect(typesFile).toContain('Record Type Examples')
    expect(typesFile).toContain('Usage Example')
  })
})

describe('Null Safety Patterns', () => {
  it('should have null safety utilities file', () => {
    const nullSafetyFile = readFileSync(
      resolve(__dirname, '../../src/lib/null-safety.ts'),
      'utf-8'
    )
    expect(nullSafetyFile).toContain('safeGet')
    expect(nullSafetyFile).toContain('isDefined')
    expect(nullSafetyFile).toContain('assertDefined')
  })

  it('should document optional chaining', () => {
    const nullSafetyFile = readFileSync(
      resolve(__dirname, '../../src/lib/null-safety.ts'),
      'utf-8'
    )
    expect(nullSafetyFile).toContain('Optional Chaining')
    expect(nullSafetyFile).toContain('?.')
  })

  it('should document nullish coalescing', () => {
    const nullSafetyFile = readFileSync(
      resolve(__dirname, '../../src/lib/null-safety.ts'),
      'utf-8'
    )
    expect(nullSafetyFile).toContain('Nullish Coalescing')
    expect(nullSafetyFile).toContain('??')
  })

  it('should document useKV null handling pattern', () => {
    const nullSafetyFile = readFileSync(
      resolve(__dirname, '../../src/lib/null-safety.ts'),
      'utf-8'
    )
    expect(nullSafetyFile).toContain('useKV')
    expect(nullSafetyFile).toContain('Spark')
    expect(nullSafetyFile).toContain('CRITICAL')
  })

  it('should filter defined values from array', () => {
    const values = [1, null, 2, undefined, 3]
    const filtered = filterDefined(values)
    expect(filtered).toEqual([1, 2, 3])
  })

  it('should identify defined values', () => {
    expect(isDefined(null)).toBe(false)
    expect(isDefined(undefined)).toBe(false)
    expect(isDefined(0)).toBe(true)
    expect(isDefined('')).toBe(true)
    expect(isDefined(false)).toBe(true)
  })
})

describe('Type-Check Script', () => {
  it('should have type-check script in package.json', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(__dirname, '../../package.json'), 'utf-8')
    )
    expect(packageJson.scripts['type-check']).toBe('tsc --noEmit')
  })
})
