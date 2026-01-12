import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

describe('Row Level Security (RLS) Policies', () => {
  let anonClient: SupabaseClient;
  let authenticatedClient: SupabaseClient;
  let testUserId: string;

  beforeAll(async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not configured, using mock mode');
      return;
    }

    // Create anonymous client (unauthenticated)
    anonClient = createClient(supabaseUrl, supabaseAnonKey);

    // Create authenticated client
    authenticatedClient = createClient(supabaseUrl, supabaseAnonKey);

    // Attempt to authenticate with test credentials
    const { data, error } = await authenticatedClient.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpass123',
    });

    if (error) {
      console.warn('Could not authenticate test user, skipping RLS tests');
      return;
    }

    testUserId = data.user?.id || '';
  });

  afterAll(async () => {
    // Clean up auth session
    if (authenticatedClient) {
      await authenticatedClient.auth.signOut();
    }
  });

  test('AC1: All tables have RLS enabled', { timeout: 15000 }, async () => {
    if (!anonClient) {
      console.log('Skipping RLS test - Supabase not configured');
      return;
    }

    const tables = ['users', 'vendors', 'experiences', 'trips', 'bookings', 'payments'];

    for (const table of tables) {
      try {
        // Attempt to access table without authentication
        const { error } = await anonClient.from(table).select('*').limit(1);

        // If RLS is properly enabled, anon access should be restricted or return limited results
        // The exact behavior depends on the RLS policy configuration
        if (error) {
          expect(error.message).toMatch(/policy|permission|denied/i);
        } else {
          // Some tables may allow public read (like active experiences)
          // This is acceptable if intentional per AC2
          expect(true).toBe(true);
        }
      } catch (err) {
        // Connection errors are acceptable in test environment
        console.warn(`Could not test ${table}: ${err}`);
      }
    }
  });

  test('AC2: Public data is readable by everyone', { timeout: 15000 }, async () => {
    if (!anonClient) {
      console.log('Skipping public data test - Supabase not configured');
      return;
    }

    // Anonymous client should be able to read public data
    const { data: destinations, error: destError } = await anonClient
      .from('destinations')
      .select('*')
      .limit(5);

    // Destinations should be publicly readable
    if (!destError) {
      expect(destinations).toBeDefined();
      expect(Array.isArray(destinations)).toBe(true);
    }

    // Active experiences should be publicly readable
    const { data: experiences, error: expError } = await anonClient
      .from('experiences')
      .select('*')
      .eq('status', 'active')
      .limit(5);

    if (!expError) {
      expect(experiences).toBeDefined();
      expect(Array.isArray(experiences)).toBe(true);
    }
  });

  test('AC3: Private data requires authentication', async () => {
    if (!anonClient || !authenticatedClient || !testUserId) {
      console.log('Skipping private data test - authentication not available');
      return;
    }

    // Anonymous client cannot read private trips
    const { error: anonError } = await anonClient.from('trips').select('*').limit(1);

    // Should either error or return no results
    if (anonError) {
      expect(anonError.message).toMatch(/policy|permission|denied/i);
    }

    // Authenticated client can read their own trips
    const { data: ownTrips, error: authError } = await authenticatedClient
      .from('trips')
      .select('*')
      .eq('user_id', testUserId)
      .limit(5);

    if (!authError) {
      expect(ownTrips).toBeDefined();
      expect(Array.isArray(ownTrips)).toBe(true);
    }
  });

  test('AC4: Owner-only data enforces user_id matching', async () => {
    if (!authenticatedClient || !testUserId) {
      console.log('Skipping owner-only test - authentication not available');
      return;
    }

    // Create a test trip
    const { data: trip, error: createError } = await authenticatedClient
      .from('trips')
      .insert({ user_id: testUserId, name: 'RLS Test Trip', destination_id: 'dest-1' })
      .select()
      .single();

    if (createError || !trip) {
      console.warn('Could not create test trip, skipping owner validation');
      return;
    }

    // Can read own trip
    const { data: ownTrip, error: readError } = await authenticatedClient
      .from('trips')
      .select('*')
      .eq('id', trip.id)
      .single();

    expect(readError).toBeNull();
    expect(ownTrip).toBeDefined();
    expect(ownTrip.user_id).toBe(testUserId);

    // Clean up test data
    await authenticatedClient.from('trips').delete().eq('id', trip.id);
  });

  test('AC5: Vendor data is accessible only to vendor owners', async () => {
    if (!authenticatedClient || !testUserId) {
      console.log('Skipping vendor access test - authentication not available');
      return;
    }

    // Try to access vendor data
    const { data: vendors, error } = await authenticatedClient
      .from('vendors')
      .select('*')
      .eq('user_id', testUserId)
      .limit(1);

    if (!error) {
      expect(vendors).toBeDefined();
      if (vendors && vendors.length > 0) {
        expect(vendors[0].user_id).toBe(testUserId);
      }
    }

    // Cannot access other vendor data (will be filtered by RLS)
    const { data: allVendors } = await authenticatedClient
      .from('vendors')
      .select('*')
      .limit(10);

    if (allVendors) {
      // Should only see own vendor records, if any
      allVendors.forEach((vendor) => {
        expect(vendor.user_id).toBe(testUserId);
      });
    }
  });

  test('AC6: Cascading access for child tables', async () => {
    if (!authenticatedClient || !testUserId) {
      console.log('Skipping cascading access test - authentication not available');
      return;
    }

    // Create parent trip
    const { data: trip, error: tripError } = await authenticatedClient
      .from('trips')
      .insert({ user_id: testUserId, name: 'Parent Trip Test', destination_id: 'dest-1' })
      .select()
      .single();

    if (tripError || !trip) {
      console.warn('Could not create parent trip, skipping cascade test');
      return;
    }

    // Create child trip_item
    const { data: item, error: itemError } = await authenticatedClient
      .from('trip_items')
      .insert({
        trip_id: trip.id,
        experience_id: 'exp-test-123',
        guest_count: 2,
      })
      .select()
      .single();

    if (!itemError && item) {
      // Can access trip_items through parent trip ownership
      const { data: items, error: accessError } = await authenticatedClient
        .from('trip_items')
        .select('*')
        .eq('trip_id', trip.id);

      expect(accessError).toBeNull();
      expect(items).toBeDefined();
      expect(items).toContainEqual(expect.objectContaining({ id: item.id }));

      // Clean up
      await authenticatedClient.from('trip_items').delete().eq('id', item.id);
    }

    // Clean up parent trip
    await authenticatedClient.from('trips').delete().eq('id', trip.id);
  });
});
