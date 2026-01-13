/**
 * Components Test
 * Epic: Foundation Setup
 * Tests: shadcn/ui and Tailwind setup validation
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('shadcn/ui Setup', () => {
  it('should have utils.ts with cn function', () => {
    const utilsFile = readFileSync(
      resolve(__dirname, '../lib/utils.ts'),
      'utf-8',
    );
    expect(utilsFile).toContain('export function cn');
    expect(utilsFile).toContain('clsx');
    expect(utilsFile).toContain('tailwind-merge');
  });

  it('should have components.json configuration', () => {
    const configFile = readFileSync(
      resolve(__dirname, '../../components.json'),
      'utf-8',
    );
    const config = JSON.parse(configFile);
    expect(config.aliases.components).toBe('@/components');
    expect(config.aliases.utils).toBe('@/lib/utils');
  });
});

describe('Button Component', () => {
  it('should have button variants file with cva', () => {
    const buttonVariantsFile = readFileSync(
      resolve(__dirname, '../components/ui/button.variants.ts'),
      'utf-8',
    );
    expect(buttonVariantsFile).toMatch(/from ['"]class-variance-authority['"]/);
    expect(buttonVariantsFile).toContain('cva');
  });

  it('should have default variant', () => {
    const buttonVariantsFile = readFileSync(
      resolve(__dirname, '../components/ui/button.variants.ts'),
      'utf-8',
    );
    expect(buttonVariantsFile).toContain('default');
  });

  it('should have primary color variant', () => {
    const buttonVariantsFile = readFileSync(
      resolve(__dirname, '../components/ui/button.variants.ts'),
      'utf-8',
    );
    // Primary variant exists
    expect(buttonVariantsFile).toContain('primary');
  });

  it('should have size variants', () => {
    const buttonVariantsFile = readFileSync(
      resolve(__dirname, '../components/ui/button.variants.ts'),
      'utf-8',
    );
    expect(buttonVariantsFile).toContain('size');
  });

  it('should have proper button component using variants', () => {
    const buttonFile = readFileSync(
      resolve(__dirname, '../components/ui/button.tsx'),
      'utf-8',
    );
    // Import can use single or double quotes
    expect(buttonFile).toMatch(/from ['\.]+\/button\.variants['"]/);
  });
});

describe('Form Components', () => {
  it('should have input component', () => {
    const inputFile = readFileSync(
      resolve(__dirname, '../components/ui/input.tsx'),
      'utf-8',
    );
    expect(inputFile).toContain('Input');
  });

  it('should have label component', () => {
    const labelFile = readFileSync(
      resolve(__dirname, '../components/ui/label.tsx'),
      'utf-8',
    );
    expect(labelFile).toContain('Label');
  });
});

describe('Card Component', () => {
  it('should have card component with proper structure', () => {
    const cardFile = readFileSync(
      resolve(__dirname, '../components/ui/card.tsx'),
      'utf-8',
    );
    expect(cardFile).toContain('Card');
    expect(cardFile).toContain('CardHeader');
    expect(cardFile).toContain('CardTitle');
    expect(cardFile).toContain('CardContent');
  });
});

describe('Dialog Component', () => {
  it('should have dialog component using Radix', () => {
    const dialogFile = readFileSync(
      resolve(__dirname, '../components/ui/dialog.tsx'),
      'utf-8',
    );
    expect(dialogFile).toContain('@radix-ui/react-dialog');
  });
});
