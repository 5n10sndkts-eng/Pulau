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
  | 'slot.availability_decremented'
  | 'slot.created'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'vendor.onboarded'
  | 'user.created'

export interface CreateAuditEntryInput {
  eventType: AuditEventType
  entityType: string
  entityId: string
  userId?: string
  metadata?: Record<string, any>
}

/**
 * Create audit log entry
 */
export async function createAuditEntry(input: CreateAuditEntryInput): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: session } = await supabase.auth.getSession()
    
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        event_type: input.eventType,
        entity_type: input.entityType,
        entity_id: input.entityId,
        user_id: input.userId || session?.session?.user?.id,
        metadata: input.metadata || {}
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
 * Get audit logs for an entity
 */
export async function getAuditLogs(entityType: string, entityId: string) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })

  return { data, error: error?.message }
}

/**
 * Get audit logs by date range
 */
export async function getAuditLogsByDateRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })

  return { data, error: error?.message }
}
