/**
 * Audit Service Module
 * Story: 28.5 - Create Audit Service Module
 * 
 * Centralized audit logging for compliance and tracking
 */

import { supabase } from './supabase'
import type { Database } from './database.types'

export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']

export type AuditEventType =
  | 'booking.created'
  | 'booking.confirmed'
  | 'booking.cancelled'
  | 'booking.refunded'
  | 'booking.checked_in'
  | 'booking.no_show'
  | 'slot.availability_decremented'
  | 'slot.created'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'vendor.onboarded'
  | 'user.created'

export type ActorType = 'user' | 'vendor' | 'system' | 'stripe'

export interface CreateAuditEntryInput {
  eventType: AuditEventType
  entityType: string
  entityId: string
  actorId?: string
  actorType?: ActorType
  metadata?: Record<string, any>
  stripeEventId?: string
}

/**
 * Sensitive keys that should be redacted from audit log metadata
 * to prevent PII/payment data exposure
 */
const SENSITIVE_KEYS = [
  'payment_method_id',
  'card_number',
  'cvv',
  'cvc',
  'password',
  'token',
  'secret',
  'api_key',
  'access_token',
  'refresh_token',
  'ssn',
  'social_security',
  'bank_account',
  'routing_number',
]

/**
 * Redact sensitive data from metadata before storing in audit logs
 */
function redactSensitiveData(metadata: Record<string, any>): Record<string, any> {
  const redacted = { ...metadata }

  for (const key of Object.keys(redacted)) {
    const lowerKey = key.toLowerCase()
    // Check if key matches any sensitive pattern
    if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive.toLowerCase()))) {
      redacted[key] = '[REDACTED]'
    }
    // Recursively redact nested objects
    if (typeof redacted[key] === 'object' && redacted[key] !== null && !Array.isArray(redacted[key])) {
      redacted[key] = redactSensitiveData(redacted[key])
    }
  }

  return redacted
}

/**
 * Create audit log entry
 */
export async function createAuditEntry(input: CreateAuditEntryInput): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: session } = await supabase.auth.getSession()

    // Redact sensitive data from metadata before storing
    const safeMetadata = input.metadata ? redactSensitiveData(input.metadata) : {}

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        event_type: input.eventType,
        entity_type: input.entityType,
        entity_id: input.entityId,
        actor_id: input.actorId || session?.session?.user?.id || null,
        actor_type: input.actorType || 'user',
        metadata: safeMetadata,
        stripe_event_id: input.stripeEventId || null
      })

    if (error) {
      console.error('Audit log error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Audit log exception:', err)
    return { success: false, error: 'Failed to create audit log' }
  }
}

/**
 * Get audit logs for an entity with actor information
 */
export async function getAuditLogs(entityType: string, entityId: string) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      actor:profiles!actor_id(id, full_name, email)
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })

  return { data, error: error?.message }
}

/**
 * Get audit logs by date range with pagination
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @param entityType - Optional filter by entity type
 * @param page - Page number (0-indexed, default 0)
 * @param pageSize - Results per page (default 100)
 */
export async function getAuditLogsByDateRange(
  startDate: string,
  endDate: string,
  entityType?: string,
  page: number = 0,
  pageSize: number = 100
) {
  const from = page * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (entityType) {
    query = query.eq('entity_type', entityType)
  }

  const { data, error, count } = await query

  return {
    data,
    error: error?.message,
    pagination: {
      page,
      pageSize,
      totalCount: count || 0,
      totalPages: count ? Math.ceil(count / pageSize) : 0,
      hasMore: count ? from + pageSize < count : false
    }
  }
}
