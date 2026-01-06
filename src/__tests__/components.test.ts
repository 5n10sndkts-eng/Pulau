/**
 * Component Architecture Tests
 * Validates Radix UI and shadcn/ui setup
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('shadcn/ui Configuration', () => {
  it('should have components.json configured', () => {
    const componentsConfig = JSON.parse(
      readFileSync(resolve(__dirname, '../../components.json'), 'utf-8')
    )
    
    expect(componentsConfig.aliases.ui).toBe('@/components/ui')
    expect(componentsConfig.aliases.components).toBe('@/components')
    expect(componentsConfig.aliases.utils).toBe('@/lib/utils')
  })

  it('should have TypeScript enabled', () => {
    const componentsConfig = JSON.parse(
      readFileSync(resolve(__dirname, '../../components.json'), 'utf-8')
    )
    expect(componentsConfig.tsx).toBe(true)
    expect(componentsConfig.rsc).toBe(false) // Not using React Server Components
  })
})

describe('class-variance-authority', () => {
  it('should be installed', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(__dirname, '../../package.json'), 'utf-8')
    )
    expect(packageJson.dependencies['class-variance-authority']).toBeDefined()
  })

  it('should have cn utility function', () => {
    const utilsFile = readFileSync(
      resolve(__dirname, '../../src/lib/utils.ts'),
      'utf-8'
    )
    expect(utilsFile).toContain('export function cn')
    expect(utilsFile).toContain('clsx')
    expect(utilsFile).toContain('twMerge')
  })
})

describe('Button Component', () => {
  it('should exist and export Button', () => {
    const buttonFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/button.tsx'),
      'utf-8'
    )
    expect(buttonFile).toContain('export { Button')
  })

  it('should have default variant using primary color', () => {
    // Variants are now in button.variants.ts
    const buttonVariantsFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/button.variants.ts'),
      'utf-8'
    )
    expect(buttonVariantsFile).toContain('bg-primary')
    expect(buttonVariantsFile).toContain('text-primary-foreground')
  })

  it('should have outline variant', () => {
    // Variants are now in button.variants.ts
    const buttonVariantsFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/button.variants.ts'),
      'utf-8'
    )
    expect(buttonVariantsFile).toContain('outline:')
  })

  it('should have ghost variant', () => {
    // Variants are now in button.variants.ts
    const buttonVariantsFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/button.variants.ts'),
      'utf-8'
    )
    expect(buttonVariantsFile).toContain('ghost:')
  })

  it('should use class-variance-authority', () => {
    // Check button.variants.ts for CVA usage
    const buttonVariantsFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/button.variants.ts'),
      'utf-8'
    )
    expect(buttonVariantsFile).toContain('from "class-variance-authority"')
    expect(buttonVariantsFile).toContain('cva(')
    
    // Check button.tsx imports from variants file
    const buttonFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/button.tsx'),
      'utf-8'
    )
    expect(buttonFile).toContain('from "./button.variants"')
  })

  it('should use Radix UI Slot for polymorphic behavior', () => {
    const buttonFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/button.tsx'),
      'utf-8'
    )
    expect(buttonFile).toContain('@radix-ui/react-slot')
    expect(buttonFile).toContain('asChild')
  })
})

describe('Card Component', () => {
  it('should exist and export Card components', () => {
    const cardFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/card.tsx'),
      'utf-8'
    )
    expect(cardFile).toContain('export {')
    expect(cardFile).toContain('Card,')
    expect(cardFile).toContain('CardHeader,')
    expect(cardFile).toContain('CardContent,')
    expect(cardFile).toContain('CardFooter,')
  })

  it('should have rounded corners', () => {
    const cardFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/card.tsx'),
      'utf-8'
    )
    expect(cardFile).toContain('rounded-xl')
  })

  it('should have shadow for elevation', () => {
    const cardFile = readFileSync(
      resolve(__dirname, '../../src/components/ui/card.tsx'),
      'utf-8'
    )
    expect(cardFile).toContain('shadow')
  })
})

describe('Radix UI Primitives', () => {
  it('should have Radix UI packages installed', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(__dirname, '../../package.json'), 'utf-8')
    )
    
    // Check for key Radix UI primitives
    expect(packageJson.dependencies['@radix-ui/react-slot']).toBeDefined()
    expect(packageJson.dependencies['@radix-ui/react-dialog']).toBeDefined()
    expect(packageJson.dependencies['@radix-ui/react-dropdown-menu']).toBeDefined()
  })
})
