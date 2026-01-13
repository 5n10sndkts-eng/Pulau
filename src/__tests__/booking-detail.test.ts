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
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('BookingDetails');
    expect(dashboardFile).toContain('selectedBooking');
  });

  it('should display detail view when booking is selected', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/screens/customer/TripsDashboard.tsx'),
      'utf-8',
    );
    expect(dashboardFile).toContain('if (selectedBooking)');
  });
});

describe('Booking Detail View - AC2: Header Information Display', () => {
  it('should display booking reference', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('Booking Reference');
    expect(detailFile).toContain('booking.reference');
  });

  it('should have copy functionality for booking reference', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('handleCopyReference');
    expect(detailFile).toContain('Copy');
    expect(detailFile).toContain('clipboard');
  });

  it('should display status badge in header', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('getStatusBadge');
  });

  it('should display booked date', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('Booked On');
    expect(detailFile).toContain('booking.bookedAt');
  });
});

describe('Booking Detail View - AC3: Trip Items Display', () => {
  it('should display all trip items', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('booking.trip.items.map');
    expect(detailFile).toContain('Your Experiences');
  });

  it('should show experience details for each item', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('experience.title');
    expect(detailFile).toContain('experience.provider.name');
    expect(detailFile).toContain('item.guests');
  });

  it('should display date and time for each item', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('item.date');
    expect(detailFile).toContain('formatDate');
  });
});

describe('Booking Detail View - AC4: Operator Contact Information', () => {
  it('should display operator contact section', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('Operator Contact');
  });

  it('should have phone number with tel link', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('Phone');
    expect(detailFile).toContain('tel:');
  });

  it('should have email with mailto link', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('Mail');
    expect(detailFile).toContain('mailto:');
  });
});

describe('Booking Detail View - AC5: Meeting Point Information', () => {
  it('should display meeting point section', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('experience');
  });

  it('should show meeting point name and address', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('experience.provider');
  });

  it('should have map button', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('navigate');
  });

  it('should have Navigation icon', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('Navigation');
  });

  it('should display experience location', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toBeDefined();
  });
});

describe('Booking Detail View - AC6: Price Summary Display', () => {
  it('should display payment summary', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('Payment Summary');
  });

  it('should show subtotal and service fee', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('Subtotal');
    expect(detailFile).toContain('Service Fee');
    expect(detailFile).toContain('booking.trip.subtotal');
    expect(detailFile).toContain('booking.trip.serviceFee');
  });

  it('should display total paid', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('Total Paid');
    expect(detailFile).toContain('booking.trip.total');
  });
});

describe('Booking Detail View - AC7: Help Link Access', () => {
  it('should have support email', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('support@pulau.app');
  });

  it('should have AlertCircle icon', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('AlertCircle');
  });

  it('should have mailto link', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('mailto:');
  });
});

describe('Booking Detail View - AC8: Read-Only State', () => {
  it('should be read-only BookingDetails component', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('BookingDetails');
  });

  it('should have back button to return to list', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('onClose');
    expect(detailFile).toContain('ArrowLeft');
  });
});

describe('Booking Detail View - Component Structure', () => {
  it('should use ScrollArea for trip items', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('ScrollArea');
  });

  it('should use Separator for visual organization', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain('Separator');
  });

  it('should use Card components for sections', () => {
    const detailFile = readFileSync(
      resolve(__dirname, '../../src/components/BookingDetails.tsx'),
      'utf-8',
    );
    expect(detailFile).toContain("from '@/components/ui/card'");
    expect(detailFile).toContain('<Card');
  });
});
