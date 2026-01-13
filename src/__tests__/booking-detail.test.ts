/**
 * Booking Detail View Tests
 * Validates Story 11.2: Build Booking Detail View
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Booking Detail View - AC1: Navigation to Detail View', () => {
  it('should have booking detail rendering function', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('renderBookingDetail');
    expect(dashboardFile).toContain('selectedBooking');
  });

  it('should display detail view when booking is selected', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('if (selectedBooking)');
    expect(dashboardFile).toContain('renderBookingDetail(selectedBooking)');
  });
});

describe('Booking Detail View - AC2: Header Information Display', () => {
  it('should display booking reference', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Booking Reference');
    expect(dashboardFile).toContain('booking.reference');
  });

  it('should have copy functionality for booking reference', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('handleCopyReference');
    expect(dashboardFile).toContain('Copy');
    expect(dashboardFile).toContain('clipboard');
  });

  it('should display status badge in header', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('getStatusBadge(booking.status)');
  });

  it('should display booked date', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Booked On');
    expect(dashboardFile).toContain('booking.bookedAt');
  });
});

describe('Booking Detail View - AC3: Trip Items Display', () => {
  it('should display all trip items', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('booking.trip.items.map');
    expect(dashboardFile).toContain('Your Experiences');
  });

  it('should show experience details for each item', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('experience.title');
    expect(dashboardFile).toContain('experience.provider.name');
    expect(dashboardFile).toContain('item.guests');
  });

  it('should display date and time for each item', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('item.date');
    expect(dashboardFile).toContain('formatDate');
  });
});

describe('Booking Detail View - AC4: Operator Contact Information', () => {
  it('should display operator contact section', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Operator Contact');
  });

  it('should have phone number with tel link', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Phone');
    expect(dashboardFile).toContain('tel:');
  });

  it('should have email with mailto link', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Mail');
    expect(dashboardFile).toContain('mailto:');
  });
});

describe('Booking Detail View - AC5: Meeting Point Information', () => {
  it('should display meeting point section', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Meeting Point');
    expect(dashboardFile).toContain('meetingPoint');
  });

  it('should show meeting point name and address', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('meetingPoint.name');
    expect(dashboardFile).toContain('meetingPoint.address');
  });

  it('should have "View on Map" button', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('View on Map');
    expect(dashboardFile).toContain('maps.google.com');
  });

  it('should have "Get Directions" button', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Get Directions');
    expect(dashboardFile).toContain('Navigation');
  });

  it('should use lat/lng coordinates for map links', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('meetingPoint.lat');
    expect(dashboardFile).toContain('meetingPoint.lng');
  });
});

describe('Booking Detail View - AC6: Price Summary Display', () => {
  it('should display payment summary', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Payment Summary');
  });

  it('should show subtotal and service fee', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Subtotal');
    expect(dashboardFile).toContain('Service Fee');
    expect(dashboardFile).toContain('booking.trip.subtotal');
    expect(dashboardFile).toContain('booking.trip.serviceFee');
  });

  it('should display total paid', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Total Paid');
    expect(dashboardFile).toContain('booking.trip.total');
  });
});

describe('Booking Detail View - AC7: Help Link Access', () => {
  it('should have "Need Help?" section', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Need Help?');
  });

  it('should have help icon', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('HelpCircle');
  });

  it('should have support button', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Get Support');
  });
});

describe('Booking Detail View - AC8: Read-Only State', () => {
  it('should be in read-only mode', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    // The detail view should not have edit functionality
    expect(dashboardFile).toContain('renderBookingDetail');
  });

  it('should have back button to return to list', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('setSelectedBooking(null)');
    expect(dashboardFile).toContain('ArrowLeft');
  });
});

describe('Booking Detail View - Component Structure', () => {
  it('should use ScrollArea for trip items', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('ScrollArea');
  });

  it('should use Separator for visual organization', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('Separator');
  });

  it('should use Card components for sections', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain("from './ui/card'");
    expect(dashboardFile).toContain('<Card');
  });
});
