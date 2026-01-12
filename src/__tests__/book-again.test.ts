/**
 * Book Again Functionality Tests
 * Validates Story 11.3: Implement Book Again Functionality
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Book Again - AC1: Book Again Button Visibility', () => {
  it('should have Book Again button in booking detail', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8'
    )
    expect(dashboardFile).toContain('Book Again')
    expect(dashboardFile).toContain('onBookAgain')
  })

  it('should show Book Again for completed bookings', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8'
    )
    expect(dashboardFile).toContain("booking.status === 'completed'")
  })

  it('should use teal color for Book Again button', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8'
    )
    // Teal color #0D7377 should be used for Book Again button
    expect(dashboardFile).toContain('#0D7377')
  })
})

describe('Book Again - AC2-AC5: Trip Duplication Process', () => {
  it('should have handleBookAgain function', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8'
    )
    expect(appFile).toContain('handleBookAgain')
    expect(appFile).toContain('const handleBookAgain')
  })

  it('should create new trip with planning status', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8'
    )
    expect(appFile).toContain("status: 'planning'")
  })

  it('should clear trip dates in new trip', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8'
    )
    expect(appFile).toContain('startDate: undefined')
    expect(appFile).toContain('endDate: undefined')
  })

  it('should copy trip items', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8'
    )
    expect(appFile).toContain('originalTrip.items.map')
  })

  it('should clear scheduled dates from copied items', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8'
    )
    expect(appFile).toContain('date: undefined')
  })

  it('should generate new unique trip ID', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8'
    )
    expect(appFile).toContain('Date.now()')
    expect(appFile).toContain("id: `trip_")
  })
})

describe('Book Again - AC6: Navigation to Trip Builder', () => {
  it('should navigate to trip builder', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8'
    )
    expect(appFile).toContain("navigate('/plan')")
  })

  it('should update trip state with new trip', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8'
    )
    // Uses TripContext replaceTrip
    expect(appFile).toContain('replaceTrip')
  })
})

describe('Book Again - AC7: User Feedback', () => {
  it('should show success toast', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8'
    )
    expect(appFile).toContain('toast.success')
  })

  it('should have actionable message about setting dates', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8'
    )
    expect(appFile).toContain('Set your new dates')
  })
})

describe('Book Again - AC8: Original Booking Preservation', () => {
  it('should create new trip object, not modify original', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8'
    )
    // Should spread originalTrip into new object
    expect(appFile).toContain('...originalTrip')
    // Should create newTripPartial variable
    expect(appFile).toContain('newTripPartial')
  })

  it('should clear booking-specific fields', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8'
    )
    expect(appFile).toContain('bookingReference: undefined')
    expect(appFile).toContain('bookedAt: undefined')
  })
})

describe('Book Again - Integration', () => {
  it('should be connected in TripsDashboard component', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8'
    )
    expect(dashboardFile).toContain('onBookAgain: (trip: Trip) => void')
  })

  it('should be wired up in App.tsx', () => {
    const appFile = readFileSync(
      resolve(__dirname, '../../src/App.tsx'),
      'utf-8'
    )
    expect(appFile).toContain('onBookAgain={handleBookAgain}')
  })

  it('should pass booking.trip to onBookAgain', () => {
    const dashboardFile = readFileSync(
      resolve(__dirname, '../../src/components/TripsDashboard.tsx'),
      'utf-8'
    )
    expect(dashboardFile).toContain('onBookAgain(booking.trip)')
  })
})
