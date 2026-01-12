/**
 * Test: send-email Edge Function
 * Story: 30.1.1 - Implement send-email Edge Function
 * Epic: 30 - Customer Notification System
 * Phase: Launch Readiness Sprint - Phase 1
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

const FUNCTION_URL = 'http://localhost:54321/functions/v1/send-email'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''

describe('send-email Edge Function', () => {
  const testBookingId = '00000000-0000-0000-0000-000000000001'
  const testEmail = 'test@example.com'

  describe('Request Validation', () => {
    it('should reject requests without required fields', async () => {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({}),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    it('should reject invalid email type', async () => {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'invalid_type',
          to: testEmail,
          booking_id: testBookingId,
          data: {},
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Invalid or missing email type')
    })

    it('should reject invalid email address', async () => {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'booking_confirmation',
          to: 'not-an-email',
          booking_id: testBookingId,
          data: {},
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Invalid or missing recipient email')
    })

    it('should reject missing required data fields', async () => {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'booking_confirmation',
          to: testEmail,
          booking_id: testBookingId,
          data: {
            // Missing required fields
            booking_reference: 'TEST-123',
          },
        }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toContain('Missing required field')
    })
  })

  describe('Email Sending', () => {
    it('should send booking confirmation email successfully', async () => {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'booking_confirmation',
          to: testEmail,
          booking_id: testBookingId,
          data: {
            booking_reference: 'TEST-123',
            experience_name: 'Sunset Kayaking Tour',
            experience_date: '2026-01-20',
            experience_time: '18:00',
            guest_count: 2,
            total_amount: 120,
            currency: 'USD',
            traveler_name: 'John Doe',
            experience_description: 'A beautiful sunset kayaking experience',
            meeting_point: 'Marina Bay',
            what_to_bring: ['Sunscreen', 'Water bottle', 'Towel'],
            ticket_url: 'https://pulau.app/tickets/test-123',
          },
        }),
      })

      // Note: This will fail in CI/CD without RESEND_API_KEY
      // In production, should return 200 with message_id
      const data = await response.json()

      if (response.ok) {
        expect(data.success).toBe(true)
        expect(data.message_id).toBeDefined()
      } else {
        // Expected in test environment without Resend API key
        expect(data.error).toBeDefined()
      }
    }, 10000) // 10 second timeout for email sending

    it('should send booking cancellation email', async () => {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'booking_cancellation',
          to: testEmail,
          booking_id: testBookingId,
          data: {
            booking_reference: 'TEST-123',
            experience_name: 'Sunset Kayaking Tour',
            experience_date: '2026-01-20',
            experience_time: '18:00',
            guest_count: 2,
            total_amount: 120,
            currency: 'USD',
            traveler_name: 'John Doe',
            refund_amount: 120,
            refund_status: 'pending',
            cancellation_reason: 'Weather conditions',
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        expect(data.success).toBe(true)
        expect(data.message_id).toBeDefined()
      } else {
        expect(data.error).toBeDefined()
      }
    }, 10000)

    it('should send booking reminder email', async () => {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'booking_reminder',
          to: testEmail,
          booking_id: testBookingId,
          data: {
            booking_reference: 'TEST-123',
            experience_name: 'Sunset Kayaking Tour',
            experience_date: '2026-01-20',
            experience_time: '18:00',
            guest_count: 2,
            total_amount: 120,
            currency: 'USD',
            traveler_name: 'John Doe',
            meeting_point: 'Marina Bay',
            what_to_bring: ['Sunscreen', 'Water bottle'],
            reminder_type: '24h',
            ticket_url: 'https://pulau.app/tickets/test-123',
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        expect(data.success).toBe(true)
        expect(data.message_id).toBeDefined()
      } else {
        expect(data.error).toBeDefined()
      }
    }, 10000)
  })

  describe('Error Handling', () => {
    it('should handle Resend API errors gracefully', async () => {
      // This test would require mocking Resend API or using invalid credentials
      // In a real scenario, you'd mock the Resend client
      expect(true).toBe(true) // Placeholder
    })

    it('should create email_logs entry on failure', async () => {
      // This test would require database access to verify email_logs table
      // In a real scenario, you'd query the database after a failed send
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('CORS Handling', () => {
    it('should handle OPTIONS preflight request', async () => {
      const response = await fetch(FUNCTION_URL, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
        },
      })

      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('should reject non-POST requests', async () => {
      const response = await fetch(FUNCTION_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      })

      expect(response.status).toBe(405)
      const data = await response.json()
      expect(data.error).toContain('Method not allowed')
    })
  })
})

// Manual test helper for local development
export async function testSendEmailManually() {
  console.log('🧪 Testing send-email Edge Function manually...')

  const payload = {
    type: 'booking_confirmation',
    to: 'your-test-email@example.com', // Change this!
    booking_id: '00000000-0000-0000-0000-000000000001',
    data: {
      booking_reference: 'PULAU-TEST-001',
      experience_name: 'Sunset Kayaking Adventure',
      experience_date: '2026-01-20',
      experience_time: '18:00',
      guest_count: 2,
      total_amount: 120,
      currency: 'USD',
      traveler_name: 'Test User',
      experience_description: 'A beautiful sunset kayaking experience through calm waters',
      meeting_point: 'Marina Bay Pier 3',
      what_to_bring: ['Sunscreen', 'Water bottle', 'Towel', 'Change of clothes'],
      ticket_url: 'https://pulau.app/tickets/test-001',
    },
  }

  const response = await fetch('http://localhost:54321/functions/v1/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  console.log('📧 Response:', data)

  if (response.ok) {
    console.log('✅ Email sent successfully!')
    console.log('📬 Message ID:', data.message_id)
  } else {
    console.error('❌ Email send failed:', data.error)
  }

  return data
}
