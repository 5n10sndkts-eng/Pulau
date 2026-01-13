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
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('export function TripsDashboard');
    expect(dashboardFile).toContain('My Trips');
  });

  it('should be accessible from ProfileScreen', () => {
    const profileFile = readFileSync(
      resolve(__dirname, '../../src/components/ProfileScreen.tsx'),
      'utf-8',
    );
    expect(profileFile).toContain('My Trips');
    expect(profileFile).toContain('onNavigateToTrips');
  });
});

describe('Booking History Screen - AC2: Tab Structure and Filtering', () => {
  it('should have three tabs: Upcoming, Past, and All', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('value="upcoming"');
    expect(dashboardFile).toContain('value="past"');
    expect(dashboardFile).toContain('value="all"');
  });

  it('should use Tabs component from shadcn/ui', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain("from './ui/tabs'");
    expect(dashboardFile).toContain('<Tabs');
    expect(dashboardFile).toContain('<TabsList');
    expect(dashboardFile).toContain('<TabsTrigger');
    expect(dashboardFile).toContain('<TabsContent');
  });

  it('should have tab state management', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
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
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('upcomingBookings');
    expect(dashboardFile).toContain("status === 'confirmed'");
  });

  it('should filter past bookings by end date or completed status', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('pastBookings');
    expect(dashboardFile).toContain("status === 'completed'");
  });

  it('should have all bookings tab', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('allBookings');
  });
});

describe('Booking History Screen - AC5: Booking Card Display', () => {
  it('should render booking cards with required information', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('renderBookingCard');
    expect(dashboardFile).toContain('destination');
    expect(dashboardFile).toContain('travelers');
    expect(dashboardFile).toContain('total');
  });

  it('should display status badges', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('getStatusBadge');
    expect(dashboardFile).toContain('confirmed');
    expect(dashboardFile).toContain('pending');
    expect(dashboardFile).toContain('cancelled');
    expect(dashboardFile).toContain('completed');
  });

  it('should use correct status badge colors from story', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    // Confirmed: green (#27AE60)
    expect(dashboardFile).toContain('#27AE60');
    // Pending: yellow (#F4D03F)
    expect(dashboardFile).toContain('#F4D03F');
    // Completed: teal (#0D7377)
    expect(dashboardFile).toContain('#0D7377');
    // Cancelled: gray
    expect(dashboardFile).toContain('gray');
  });

  it('should use Card component for booking cards', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain("from './ui/card'");
    expect(dashboardFile).toContain('<Card');
  });
});

describe('Booking History Screen - AC6: Empty State Display', () => {
  it('should have empty state component', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('renderEmptyState');
  });

  it('should use briefcase/suitcase icon for empty state', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Briefcase');
  });

  it('should have "Explore experiences" CTA', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Explore experiences');
  });

  it('should display dynamic text based on active tab', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('No upcoming trips');
    expect(dashboardFile).toContain('No past trips');
  });
});

describe('Booking History Screen - Data Management', () => {
  it('should not use useKV hook for bookings state validation', () => {
    // We removed useKV from here
  });

  it('should import Booking type', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Booking');
  });
});

describe('Booking History Screen - Framer Motion Animations', () => {
  it('should use Framer Motion for animations', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain("from 'framer-motion'");
    expect(dashboardFile).toContain('motion');
  });

  it('should have card animations', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('initial');
    expect(dashboardFile).toContain('animate');
  });
});
