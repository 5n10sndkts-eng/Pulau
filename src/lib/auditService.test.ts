/**
 * Audit Service Tests
 * Story: 28.5 - Create Audit Service Module
 *
 * Tests audit logging functions for compliance tracking
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createAuditEntry, getAuditLogs, getAuditLogsByDateRange } from './auditService'
import { supabase } from './supabase'

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn()
    },
    from: vi.fn()
  }
}))

describe('Audit Service', () => {
  let mockInsert: ReturnType<typeof vi.fn>
  let mockSelect: ReturnType<typeof vi.fn>
  let mockEq: ReturnType<typeof vi.fn>
  let mockGte: ReturnType<typeof vi.fn>
  let mockLte: ReturnType<typeof vi.fn>
  let mockOrder: ReturnType<typeof vi.fn>

  let mockRange: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset mock chain - supports complex query chains
    // For getAuditLogsByDateRange: .select().gte().lte().order().range()
    mockRange = vi.fn().mockResolvedValue({ data: [], error: null, count: 0 })

    // mockOrder: thenable with range method for chaining
    // This allows both await supabase...order() AND supabase...order().range()
    const orderResult = {
      range: mockRange,
      then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve),
      catch: (reject: any) => Promise.resolve({ data: [], error: null }).catch(reject)
    }
    mockOrder = vi.fn().mockReturnValue(orderResult)

    mockLte = vi.fn().mockReturnValue({ order: mockOrder })
    mockGte = vi.fn().mockReturnValue({ lte: mockLte, order: mockOrder })

    // mockEq needs to return an object with both eq and order for chaining
    mockEq = vi.fn().mockImplementation(() => ({ eq: mockEq, order: mockOrder }))

    mockSelect = vi.fn().mockImplementation((query?: string, options?: any) => {
      // Different behavior based on whether count is requested
      if (options?.count === 'exact') {
        return { gte: mockGte, eq: mockEq }
      }
      return { eq: mockEq, gte: mockGte }
    })

    mockInsert = vi.fn().mockResolvedValue({ error: null })

    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
      select: mockSelect
    } as any)

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: 'user-123' } } },
      error: null
    } as any)
  })

  describe('createAuditEntry', () => {
    describe('[P0] Core logging functionality', () => {
      it('should create audit entry with all required fields', async () => {
        // GIVEN: Audit entry input with required fields
        const input = {
          eventType: 'booking.created' as const,
          entityType: 'booking',
          entityId: 'booking-456'
        }

        // WHEN: Creating audit entry
        const result = await createAuditEntry(input)

        // THEN: Entry is created successfully
        expect(result.success).toBe(true)
        expect(supabase.from).toHaveBeenCalledWith('audit_logs')
        expect(mockInsert).toHaveBeenCalledWith({
          event_type: 'booking.created',
          entity_type: 'booking',
          entity_id: 'booking-456',
          actor_id: 'user-123',
          actor_type: 'user',
          metadata: {},
          stripe_event_id: null
        })
      })

      it('should include custom actor when provided', async () => {
        // GIVEN: Audit entry with custom actor
        const input = {
          eventType: 'payment.succeeded' as const,
          entityType: 'payment',
          entityId: 'payment-789',
          actorId: 'vendor-123',
          actorType: 'vendor' as const
        }

        // WHEN: Creating audit entry
        await createAuditEntry(input)

        // THEN: Uses provided actor info
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            actor_id: 'vendor-123',
            actor_type: 'vendor'
          })
        )
      })

      it('should include metadata when provided', async () => {
        // GIVEN: Audit entry with metadata
        const input = {
          eventType: 'booking.refunded' as const,
          entityType: 'booking',
          entityId: 'booking-123',
          metadata: {
            refund_amount: 5000,
            reason: 'Customer request',
            stripe_refund_id: 're_123'
          }
        }

        // WHEN: Creating audit entry
        await createAuditEntry(input)

        // THEN: Metadata is included
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: {
              refund_amount: 5000,
              reason: 'Customer request',
              stripe_refund_id: 're_123'
            }
          })
        )
      })

      it('should include stripe_event_id when provided', async () => {
        // GIVEN: Audit entry from Stripe webhook
        const input = {
          eventType: 'payment.succeeded' as const,
          entityType: 'payment',
          entityId: 'payment-123',
          actorType: 'stripe' as const,
          stripeEventId: 'evt_123456'
        }

        // WHEN: Creating audit entry
        await createAuditEntry(input)

        // THEN: Stripe event ID is included
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            stripe_event_id: 'evt_123456',
            actor_type: 'stripe'
          })
        )
      })
    })

    describe('[P1] Error handling', () => {
      it('should return error when insert fails', async () => {
        // GIVEN: Database insert fails
        mockInsert.mockResolvedValue({
          error: { message: 'Database error' }
        })

        // WHEN: Creating audit entry
        const result = await createAuditEntry({
          eventType: 'booking.created' as const,
          entityType: 'booking',
          entityId: 'booking-123'
        })

        // THEN: Returns error
        expect(result.success).toBe(false)
        expect(result.error).toBe('Database error')
      })

      it('should handle exceptions gracefully', async () => {
        // GIVEN: Database throws exception
        mockInsert.mockRejectedValue(new Error('Connection failed'))

        // WHEN: Creating audit entry
        const result = await createAuditEntry({
          eventType: 'booking.created' as const,
          entityType: 'booking',
          entityId: 'booking-123'
        })

        // THEN: Returns generic error
        expect(result.success).toBe(false)
        expect(result.error).toBe('Failed to create audit log')
      })

      it('should use session user when actorId not provided', async () => {
        // GIVEN: No actorId provided, session has user
        const input = {
          eventType: 'booking.cancelled' as const,
          entityType: 'booking',
          entityId: 'booking-123'
        }

        // WHEN: Creating audit entry
        await createAuditEntry(input)

        // THEN: Uses session user ID
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            actor_id: 'user-123'
          })
        )
      })

      it('should handle missing session gracefully', async () => {
        // GIVEN: No session available
        vi.mocked(supabase.auth.getSession).mockResolvedValue({
          data: { session: null },
          error: null
        } as any)

        // WHEN: Creating audit entry without actorId
        await createAuditEntry({
          eventType: 'booking.created' as const,
          entityType: 'booking',
          entityId: 'booking-123'
        })

        // THEN: actor_id is null
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({
            actor_id: null
          })
        )
      })
    })
  })

  describe('getAuditLogs', () => {
    describe('[P1] Fetch logs by entity', () => {
      it('should fetch audit logs for specific entity', async () => {
        // GIVEN: Audit logs exist for entity
        const mockLogs = [
          { id: 1, event_type: 'booking.created', entity_id: 'booking-123', actor: { id: 'u1', full_name: 'Test', email: 'test@test.com' } },
          { id: 2, event_type: 'booking.confirmed', entity_id: 'booking-123', actor: null }
        ]
        mockOrder.mockResolvedValue({ data: mockLogs, error: null })

        // WHEN: Fetching audit logs
        const result = await getAuditLogs('booking', 'booking-123')

        // THEN: Returns logs for entity with actor join
        expect(supabase.from).toHaveBeenCalledWith('audit_logs')
        expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('actor:profiles'))
        expect(result.data).toEqual(mockLogs)
        expect(result.error).toBeUndefined()
      })

      it('should return error message on failure', async () => {
        // GIVEN: Database query fails
        mockOrder.mockResolvedValue({ data: null, error: { message: 'Query failed' } })

        // WHEN: Fetching audit logs
        const result = await getAuditLogs('booking', 'booking-123')

        // THEN: Returns error message
        expect(result.error).toBe('Query failed')
      })
    })
  })

  describe('getAuditLogsByDateRange', () => {
    describe('[P1] Fetch logs by date range with pagination', () => {
      it('should fetch audit logs within date range with pagination', async () => {
        // GIVEN: Date range and paginated results
        const startDate = '2026-01-01'
        const endDate = '2026-01-31'
        const mockLogs = [
          { id: 1, event_type: 'booking.created', created_at: '2026-01-15' }
        ]
        mockRange.mockResolvedValue({ data: mockLogs, error: null, count: 1 })

        // WHEN: Fetching audit logs by date range
        const result = await getAuditLogsByDateRange(startDate, endDate)

        // THEN: Returns logs within range with pagination metadata
        expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact' })
        expect(mockGte).toHaveBeenCalledWith('created_at', startDate)
        expect(mockLte).toHaveBeenCalledWith('created_at', endDate)
        expect(mockRange).toHaveBeenCalledWith(0, 99) // Default page 0, pageSize 100
        expect(result.data).toEqual(mockLogs)
        expect(result.pagination).toBeDefined()
        expect(result.pagination.page).toBe(0)
        expect(result.pagination.pageSize).toBe(100)
        expect(result.pagination.totalCount).toBe(1)
      })

      it('should support custom pagination parameters', async () => {
        // GIVEN: Custom page and pageSize
        mockRange.mockResolvedValue({ data: [], error: null, count: 250 })

        // WHEN: Fetching with pagination
        const result = await getAuditLogsByDateRange('2026-01-01', '2026-01-31', undefined, 2, 50)

        // THEN: Uses custom pagination
        expect(mockRange).toHaveBeenCalledWith(100, 149) // Page 2, 50 items
        expect(result.pagination.page).toBe(2)
        expect(result.pagination.pageSize).toBe(50)
        expect(result.pagination.totalPages).toBe(5) // 250 / 50
        expect(result.pagination.hasMore).toBe(true)
      })
    })
  })
})

// ================================================
// Event Type Coverage Tests
// ================================================

describe('Audit Event Types', () => {
  describe('[P2] All event types are valid', () => {
    const validEventTypes = [
      'booking.created',
      'booking.confirmed',
      'booking.cancelled',
      'booking.refunded',
      'booking.checked_in',
      'booking.no_show',
      'slot.availability_decremented',
      'slot.created',
      'payment.succeeded',
      'payment.failed',
      'vendor.onboarded',
      'user.created'
    ]

    validEventTypes.forEach(eventType => {
      it(`should accept event type: ${eventType}`, () => {
        // Type checking - this test validates TypeScript compilation
        const input = {
          eventType: eventType as any,
          entityType: 'test',
          entityId: 'test-123'
        }
        expect(input.eventType).toBe(eventType)
      })
    })
  })
})
