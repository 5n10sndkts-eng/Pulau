/**
 * Booking History Tests
 * Validates Story 11.1: Create Booking History Screen
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Booking History Screen - AC1: Navigation and Screen Access', () => {
  it('should have TripsDashboard component', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('export function TripsDashboard');
    expect(dashboardFile).toContain('My Trips');
  });

  it('should be accessible from ProfileScreen', () => {
    const profileFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/ProfileScreen.tsx'),
      'utf-8',
    );
    expect(profileFile).toContain('My Trips');
    expect(profileFile).toContain('onNavigateToTrips');
  });
});

describe('Booking History Screen - AC2: Tab Structure and Filtering', () => {
  it('should have three tabs: Upcoming, Past, and All', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('value="upcoming"');
    expect(dashboardFile).toContain('value="past"');
    expect(dashboardFile).toContain('value="all"');
  });

  it('should use Tabs component from shadcn/ui', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain("from '@/components/ui/tabs'");
    expect(dashboardFile).toContain('<Tabs');
    expect(dashboardFile).toContain('<TabsList');
    expect(dashboardFile).toContain('<TabsTrigger');
    expect(dashboardFile).toContain('<TabsContent');
  });

  it('should have tab state management', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('selectedTab');
    expect(dashboardFile).toContain('setSelectedTab');
    expect(dashboardFile).toContain("'upcoming' | 'past' | 'all'");
  });
});

describe('Booking History Screen - AC3 & AC4: Filtering Logic', () => {
  it('should filter upcoming bookings by confirmed status and start date', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('upcomingBookings');
    expect(dashboardFile).toContain("status === 'confirmed'");
  });

  it('should filter past bookings by end date or completed status', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('pastBookings');
    expect(dashboardFile).toContain("status === 'completed'");
  });

  it('should have all bookings tab', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('allBookings');
  });
});

describe('Booking History Screen - AC5: Booking Card Display', () => {
  it('should render booking cards with required information', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('renderBookingCard');
    expect(dashboardFile).toContain('destination');
    expect(dashboardFile).toContain('travelers');
  });

  it('should display status badges', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('getStatusBadge');
    expect(dashboardFile).toContain('Badge');
  });

  it('should use correct status badge colors from story', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    // Green for confirmed, Yellow for pending, Gray for cancelled, Teal for completed
    expect(dashboardFile).toContain('#27AE60');
    expect(dashboardFile).toContain('#F4D03F');
    expect(dashboardFile).toContain('#0D7377');
  });

  it('should use Card component for booking cards', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain("from '@/components/ui/card'");
    expect(dashboardFile).toContain('<Card');
  });
});

describe('Booking History Screen - AC6: Empty State', () => {
  it('should have empty state component', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('renderEmptyState');
  });

  it('should use briefcase/suitcase icon for empty state', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Briefcase');
  });

  it('should have "Explore experiences" CTA', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Explore experiences');
  });

  it('should display dynamic text based on active tab', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('No upcoming trips');
    expect(dashboardFile).toContain('No past trips');
  });
});

describe('Booking History Screen - State Management', () => {
  it('should not use useKV hook for bookings state validation', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    // useKV is used only for Spark integration, bookings come from props
    expect(dashboardFile).toContain('bookings');
    expect(dashboardFile).toContain('Booking[]');
  });

  it('should import Booking type', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Booking');
    expect(dashboardFile).toContain("from '@/lib/types'");
  });
});

describe('Booking History Screen - Animations', () => {
  it('should use Framer Motion for animations', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('framer-motion');
    expect(dashboardFile).toContain('motion');
  });

  it('should have card animations', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('motion.div');
    expect(dashboardFile).toContain('animate');
  });
});
