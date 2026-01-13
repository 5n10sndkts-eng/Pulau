import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

/**
 * Validates if a string is a valid URL
 */
const isValidUrl = (url: string | undefined): url is string => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if Supabase is properly configured with valid credentials
 * Use this to conditionally enable/disable Supabase features
 */
export function isSupabaseConfigured(): boolean {
  return (
    isValidUrl(supabaseUrl) &&
    !!supabaseAnonKey &&
    supabaseAnonKey !== 'placeholder-key' &&
    supabaseAnonKey !== 'your-anon-key-here' &&
    !supabaseUrl?.includes('your-project-ref') &&
    !supabaseUrl?.includes('placeholder')
  );
}

// Determine which URL/key to use (fallback for mock mode)
const urlToUse = isValidUrl(supabaseUrl)
  ? supabaseUrl
  : 'https://placeholder.supabase.co';
const keyToUse = supabaseAnonKey || 'placeholder-key';

// Log configuration status (dev mode only)
if (import.meta.env.DEV) {
  if (!isSupabaseConfigured()) {
    console.warn(
      '⚠️ Supabase not configured. Using mock mode.\n' +
        '   To enable Supabase:\n' +
        '   1. Create project at supabase.com\n' +
        '   2. Copy .env.example to .env.local\n' +
        '   3. Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
    );
  }
}

/**
 * Supabase client instance
 * Typed with Database schema for full type safety
 */
export const supabase = createClient<Database>(urlToUse, keyToUse);

/**
 * Test Supabase connection by attempting to get session
 * Call this on app mount in dev mode to verify setup
 * @returns Connection status object
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  configured: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { connected: false, configured: false };
  }

  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return { connected: false, configured: true, error: error.message };
    }
    if (import.meta.env.DEV) {
      console.log('✅ Supabase connected successfully');
    }
    return { connected: true, configured: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { connected: false, configured: true, error: message };
  }
}
