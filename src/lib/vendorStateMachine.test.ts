
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    vendorStateMachine,
    getVendorCapabilities,
    canVendorPerform,
    isValidTransition,
    getValidNextStates,
    determineStateFromStripeData
} from './vendorStateMachine'

// Mock Supabase
vi.mock('./supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
            eq: vi.fn(),
            single: vi.fn(),
        })),
    },
}))

describe('Vendor State Machine', () => {

    describe('Capabilities', () => {
        it('should correctly define capabilities for "registered" state', () => {
            const caps = getVendorCapabilities('registered')
            expect(caps.canCreateExperiences).toBe(true)
            expect(caps.canEditExperiences).toBe(true)
            expect(caps.canPublishExperiences).toBe(false)
            expect(caps.canEnableInstantBook).toBe(false)
            expect(caps.canReceivePayments).toBe(false)
            expect(caps.canAccessDashboard).toBe(true)
        })

        it('should correctly define capabilities for "kyc_verified" state', () => {
            const caps = getVendorCapabilities('kyc_verified')
            expect(caps.canCreateExperiences).toBe(true)
            expect(caps.canPublishExperiences).toBe(true)
            expect(caps.canEnableInstantBook).toBe(false) // Needs verified bank
            expect(caps.canReceivePayments).toBe(false)
        })

        it('should correctly define capabilities for "active" state', () => {
            const caps = getVendorCapabilities('active')
            expect(caps.canCreateExperiences).toBe(true)
            expect(caps.canPublishExperiences).toBe(true)
            expect(caps.canEnableInstantBook).toBe(true)
            expect(caps.canReceivePayments).toBe(true)
        })

        it('should restrict capabilities for "suspended" state', () => {
            const caps = getVendorCapabilities('suspended')
            expect(caps.canCreateExperiences).toBe(false)
            expect(caps.canPublishExperiences).toBe(false)
            expect(caps.canAccessDashboard).toBe(false)
        })

        it('should check specific capability via canVendorPerform', () => {
            expect(canVendorPerform('active', 'canReceivePayments')).toBe(true)
            expect(canVendorPerform('registered', 'canReceivePayments')).toBe(false)
        })
    })

    describe('Transitions', () => {
        it('should validate allowed transitions', () => {
            expect(isValidTransition('registered', 'kyc_submitted')).toBe(true)
            expect(isValidTransition('kyc_submitted', 'kyc_verified')).toBe(true)
            expect(isValidTransition('kyc_submitted', 'kyc_rejected')).toBe(true)
        })

        it('should reject invalid transitions', () => {
            expect(isValidTransition('registered', 'active')).toBe(false)
            expect(isValidTransition('registered', 'bank_linked')).toBe(false)
            expect(isValidTransition('kyc_rejected', 'active')).toBe(false)
        })

        it('should return valid next states', () => {
            const nextStates = getValidNextStates('kyc_submitted')
            expect(nextStates).toContain('kyc_verified')
            expect(nextStates).toContain('kyc_rejected')
            expect(nextStates).toHaveLength(2)
        })
    })

    describe('Stripe Data Mapping', () => {
        it('should map to "registered" if no account exists', () => {
            const state = determineStateFromStripeData({
                hasAccount: false,
                chargesEnabled: false,
                payoutsEnabled: false,
                detailsSubmitted: false
            })
            expect(state).toBe('registered')
        })

        it('should map to "bank_linked" if charges and payouts enabled', () => {
            const state = determineStateFromStripeData({
                hasAccount: true,
                chargesEnabled: true,
                payoutsEnabled: true,
                detailsSubmitted: true
            })
            expect(state).toBe('bank_linked')
        })

        it('should map to "kyc_verified" if charges enabled but payouts disabled', () => {
            const state = determineStateFromStripeData({
                hasAccount: true,
                chargesEnabled: true,
                payoutsEnabled: false,
                detailsSubmitted: true
            })
            expect(state).toBe('kyc_verified')
        })

        it('should map to "kyc_submitted" if details submitted but not enabled', () => {
            const state = determineStateFromStripeData({
                hasAccount: true,
                chargesEnabled: false,
                payoutsEnabled: false,
                detailsSubmitted: true
            })
            expect(state).toBe('kyc_submitted')
        })
    })

})
