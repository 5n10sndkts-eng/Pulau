/**
 * Slot Service Module
 * Story: 23.5 - Create Slot Service Module
 * Phase: 2a - Core Transactional
 *
 * Provides centralized, type-safe CRUD operations for experience availability slots.
 * All mutations create audit log entries for compliance tracking.
 */

import { supabase } from './supabase'
import type { Database } from './database.types'

// ================================================
// TYPE DEFINITIONS
// ================================================

export type ExperienceSlot = Database['public']['Tables']['experience_slots']['Row']
export type ExperienceSlotInsert = Database['public']['Tables']['experience_slots']['Insert']
export type ExperienceSlotUpdate = Database['public']['Tables']['experience_slots']['Update']

/**
 * Input for creating a new slot
 */
export interface SlotCreateInput {
  experienceId: string
  slotDate: string         // YYYY-MM-DD format
  slotTime: string         // HH:MM format
  totalCapacity: number
  priceOverrideAmount?: number | null  // In cents, null = use base price
}

/**
 * Input for updating an existing slot
 */
export interface SlotUpdateInput {
  totalCapacity?: number
  availableCount?: number
  priceOverrideAmount?: number | null
  isBlocked?: boolean
}

/**
 * Date range for querying slots
 */
export interface DateRange {
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
}

/**
 * Result of a slot operation
 */
export interface SlotOperationResult<T = ExperienceSlot> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Result for bulk operations
 */
export interface SlotBulkResult {
  success: boolean
  created: number
  failed: number
  errors: string[]
}

// ================================================
// SLOT CREATION
// ================================================

/**
 * Create a new availability slot for an experience
 */
export async function createSlot(
  input: SlotCreateInput
): Promise<SlotOperationResult> {
  try {
    const slotData: ExperienceSlotInsert = {
      experience_id: input.experienceId,
      slot_date: input.slotDate,
      slot_time: input.slotTime,
      total_capacity: input.totalCapacity,
      available_count: input.totalCapacity, // Initially fully available
      price_override_amount: input.priceOverrideAmount ?? null,
      is_blocked: false,
    }

    const { data, error } = await supabase
      .from('experience_slots')
      .insert(slotData)
      .select()
      .single()

    if (error) {
      // Handle duplicate slot error
      if (error.code === '23505') {
        return {
          success: false,
          error: `A slot already exists for ${input.slotDate} at ${input.slotTime}`,
        }
      }
      return { success: false, error: error.message }
    }

    // Create audit log
    await createSlotAuditLog({
      eventType: 'slot.created',
      slotId: data.id,
      experienceId: input.experienceId,
      metadata: {
        slot_date: input.slotDate,
        slot_time: input.slotTime,
        total_capacity: input.totalCapacity,
        price_override: input.priceOverrideAmount,
      },
    })

    return { success: true, data }
  } catch (e) {
    console.error('createSlot error:', e)
    return { success: false, error: 'Failed to create slot' }
  }
}

/**
 * Create multiple slots at once (for recurring patterns)
 */
export async function createBulkSlots(
  inputs: SlotCreateInput[]
): Promise<SlotBulkResult> {
  const result: SlotBulkResult = {
    success: true,
    created: 0,
    failed: 0,
    errors: [],
  }

  for (const input of inputs) {
    const res = await createSlot(input)
    if (res.success) {
      result.created++
    } else {
      result.failed++
      result.errors.push(res.error || `Failed: ${input.slotDate} ${input.slotTime}`)
    }
  }

  result.success = result.failed === 0
  return result
}

// ================================================
// SLOT QUERIES
// ================================================

/**
 * Get available slots for an experience within a date range
 */
export async function getAvailableSlots(
  experienceId: string,
  dateRange: DateRange
): Promise<ExperienceSlot[]> {
  const { data, error } = await supabase
    .from('experience_slots')
    .select('*')
    .eq('experience_id', experienceId)
    .gte('slot_date', dateRange.startDate)
    .lte('slot_date', dateRange.endDate)
    .eq('is_blocked', false)
    .gt('available_count', 0)
    .order('slot_date', { ascending: true })
    .order('slot_time', { ascending: true })

  if (error) {
    console.error('getAvailableSlots error:', error)
    return []
  }

  return data || []
}

/**
 * Get all slots for an experience (including blocked and sold out)
 */
export async function getAllSlots(
  experienceId: string,
  dateRange: DateRange
): Promise<ExperienceSlot[]> {
  const { data, error } = await supabase
    .from('experience_slots')
    .select('*')
    .eq('experience_id', experienceId)
    .gte('slot_date', dateRange.startDate)
    .lte('slot_date', dateRange.endDate)
    .order('slot_date', { ascending: true })
    .order('slot_time', { ascending: true })

  if (error) {
    console.error('getAllSlots error:', error)
    return []
  }

  return data || []
}

/**
 * Get a single slot by ID
 */
export async function getSlotById(
  slotId: string
): Promise<ExperienceSlot | null> {
  const { data, error } = await supabase
    .from('experience_slots')
    .select('*')
    .eq('id', slotId)
    .single()

  if (error) {
    console.error('getSlotById error:', error)
    return null
  }

  return data
}

// ================================================
// SLOT UPDATES
// ================================================

/**
 * Update slot details
 */
export async function updateSlot(
  slotId: string,
  updates: SlotUpdateInput
): Promise<SlotOperationResult> {
  try {
    const updateData: ExperienceSlotUpdate = {}

    if (updates.totalCapacity !== undefined) {
      updateData.total_capacity = updates.totalCapacity
    }
    if (updates.availableCount !== undefined) {
      updateData.available_count = updates.availableCount
    }
    if (updates.priceOverrideAmount !== undefined) {
      updateData.price_override_amount = updates.priceOverrideAmount
    }
    if (updates.isBlocked !== undefined) {
      updateData.is_blocked = updates.isBlocked
    }

    const { data, error } = await supabase
      .from('experience_slots')
      .update(updateData)
      .eq('id', slotId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Create audit log
    await createSlotAuditLog({
      eventType: 'slot.updated',
      slotId,
      experienceId: data.experience_id,
      metadata: { updates },
    })

    return { success: true, data }
  } catch (e) {
    console.error('updateSlot error:', e)
    return { success: false, error: 'Failed to update slot' }
  }
}

// ================================================
// SLOT BLOCKING
// ================================================

/**
 * Block a slot (makes it unavailable to travelers)
 */
export async function blockSlot(
  slotId: string,
  reason?: string
): Promise<SlotOperationResult> {
  try {
    const { data, error } = await supabase
      .from('experience_slots')
      .update({ is_blocked: true })
      .eq('id', slotId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Create audit log
    await createSlotAuditLog({
      eventType: 'slot.blocked',
      slotId,
      experienceId: data.experience_id,
      metadata: { reason: reason || 'No reason provided' },
    })

    return { success: true, data }
  } catch (e) {
    console.error('blockSlot error:', e)
    return { success: false, error: 'Failed to block slot' }
  }
}

/**
 * Unblock a slot (makes it available again)
 */
export async function unblockSlot(
  slotId: string
): Promise<SlotOperationResult> {
  try {
    const { data, error } = await supabase
      .from('experience_slots')
      .update({ is_blocked: false })
      .eq('id', slotId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Create audit log
    await createSlotAuditLog({
      eventType: 'slot.unblocked',
      slotId,
      experienceId: data.experience_id,
      metadata: {},
    })

    return { success: true, data }
  } catch (e) {
    console.error('unblockSlot error:', e)
    return { success: false, error: 'Failed to unblock slot' }
  }
}

// ================================================
// AVAILABILITY OPERATIONS
// ================================================

/**
 * Atomically decrement slot availability.
 * Uses optimistic locking pattern to prevent overbooking.
 *
 * Returns success only if the decrement was successful and
 * the resulting available_count is >= 0.
 */
export async function decrementAvailability(
  slotId: string,
  count: number
): Promise<SlotOperationResult> {
  if (count <= 0) {
    return { success: false, error: 'Count must be positive' }
  }

  // Use optimistic locking approach for atomic decrement
  return decrementAvailabilityWithLock(slotId, count)
}

/**
 * Decrement availability with optimistic locking.
 * Uses SELECT FOR UPDATE equivalent through conditional update pattern.
 */
async function decrementAvailabilityWithLock(
  slotId: string,
  count: number
): Promise<SlotOperationResult> {
  // First, check current availability
  const { data: slot, error: fetchError } = await supabase
    .from('experience_slots')
    .select('*')
    .eq('id', slotId)
    .single()

  if (fetchError || !slot) {
    return { success: false, error: 'Slot not found' }
  }

  if (slot.is_blocked) {
    return { success: false, error: 'Slot is blocked' }
  }

  if (slot.available_count < count) {
    return {
      success: false,
      error: `Not enough availability. Requested: ${count}, Available: ${slot.available_count}`,
    }
  }

  // Attempt atomic update with version check
  const { data, error } = await supabase
    .from('experience_slots')
    .update({ available_count: slot.available_count - count })
    .eq('id', slotId)
    .eq('available_count', slot.available_count) // Optimistic lock
    .select()
    .single()

  if (error) {
    // Race condition - another request modified the slot
    return {
      success: false,
      error: 'Availability changed during booking. Please try again.',
    }
  }

  // Create audit log
  await createSlotAuditLog({
    eventType: 'slot.availability_decremented',
    slotId,
    experienceId: data.experience_id,
    metadata: {
      count_decremented: count,
      new_available_count: data.available_count,
    },
  })

  return { success: true, data }
}

/**
 * Increment slot availability (e.g., when a booking is cancelled)
 */
export async function incrementAvailability(
  slotId: string,
  count: number
): Promise<SlotOperationResult> {
  if (count <= 0) {
    return { success: false, error: 'Count must be positive' }
  }

  try {
    const { data: slot, error: fetchError } = await supabase
      .from('experience_slots')
      .select('*')
      .eq('id', slotId)
      .single()

    if (fetchError || !slot) {
      return { success: false, error: 'Slot not found' }
    }

    const newCount = Math.min(slot.available_count + count, slot.total_capacity)

    const { data, error } = await supabase
      .from('experience_slots')
      .update({ available_count: newCount })
      .eq('id', slotId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Create audit log
    await createSlotAuditLog({
      eventType: 'slot.availability_incremented',
      slotId,
      experienceId: data.experience_id,
      metadata: {
        count_incremented: count,
        new_available_count: data.available_count,
      },
    })

    return { success: true, data }
  } catch (e) {
    console.error('incrementAvailability error:', e)
    return { success: false, error: 'Failed to increment availability' }
  }
}

// ================================================
// SLOT DELETION
// ================================================

/**
 * Delete a slot (only if no bookings exist)
 */
export async function deleteSlot(
  slotId: string
): Promise<SlotOperationResult<{ deleted: boolean }>> {
  try {
    // First get the slot for audit logging
    const slot = await getSlotById(slotId)
    if (!slot) {
      return { success: false, error: 'Slot not found' }
    }

    // Check if slot has any bookings (available_count < total_capacity)
    if (slot.available_count < slot.total_capacity) {
      return {
        success: false,
        error: 'Cannot delete slot with existing bookings',
      }
    }

    const { error } = await supabase
      .from('experience_slots')
      .delete()
      .eq('id', slotId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Create audit log
    await createSlotAuditLog({
      eventType: 'slot.deleted',
      slotId,
      experienceId: slot.experience_id,
      metadata: {
        slot_date: slot.slot_date,
        slot_time: slot.slot_time,
      },
    })

    return { success: true, data: { deleted: true } }
  } catch (e) {
    console.error('deleteSlot error:', e)
    return { success: false, error: 'Failed to delete slot' }
  }
}

// ================================================
// AUDIT LOGGING
// ================================================

interface SlotAuditLogParams {
  eventType: string
  slotId: string
  experienceId: string
  metadata: Record<string, unknown>
}

async function createSlotAuditLog(params: SlotAuditLogParams): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      event_type: params.eventType,
      entity_type: 'experience_slot',
      entity_id: params.slotId,
      actor_type: 'vendor', // Slot operations are typically vendor-initiated
      metadata: {
        experience_id: params.experienceId,
        ...params.metadata,
      },
    })
  } catch (e) {
    // Don't fail the operation if audit log fails
    console.error('Failed to create slot audit log:', e)
  }
}

// ================================================
// CUT-OFF TIME UTILITIES
// ================================================

/**
 * Check if a slot is within the cut-off window (booking closed).
 * Cut-off is calculated from the slot's start time.
 *
 * @param slotDate - Slot date in YYYY-MM-DD format
 * @param slotTime - Slot time in HH:MM format
 * @param cutoffHours - Hours before start when booking closes
 * @returns true if the slot is within the cut-off window (unavailable for booking)
 */
export function isSlotWithinCutoff(
  slotDate: string,
  slotTime: string,
  cutoffHours: number
): boolean {
  const slotDateTime = new Date(`${slotDate}T${slotTime}:00`)
  const cutoffTime = new Date(slotDateTime.getTime() - (cutoffHours * 60 * 60 * 1000))
  return new Date() >= cutoffTime
}

/**
 * Get time remaining until cut-off for a slot.
 * Returns null if already within cut-off window.
 *
 * @returns Object with hours and minutes remaining, or null if past cut-off
 */
export function getTimeUntilCutoff(
  slotDate: string,
  slotTime: string,
  cutoffHours: number
): { hours: number; minutes: number } | null {
  const slotDateTime = new Date(`${slotDate}T${slotTime}:00`)
  const cutoffTime = new Date(slotDateTime.getTime() - (cutoffHours * 60 * 60 * 1000))
  const now = new Date()

  if (now >= cutoffTime) {
    return null // Already past cut-off
  }

  const msRemaining = cutoffTime.getTime() - now.getTime()
  const hoursRemaining = Math.floor(msRemaining / (60 * 60 * 1000))
  const minutesRemaining = Math.floor((msRemaining % (60 * 60 * 1000)) / (60 * 1000))

  return { hours: hoursRemaining, minutes: minutesRemaining }
}

/**
 * Format cut-off time remaining for display.
 * Returns a human-readable string like "2h 30m" or "Booking closed"
 */
export function formatCutoffRemaining(
  slotDate: string,
  slotTime: string,
  cutoffHours: number
): string {
  const remaining = getTimeUntilCutoff(slotDate, slotTime, cutoffHours)

  if (!remaining) {
    return 'Booking closed'
  }

  if (remaining.hours === 0) {
    return `${remaining.minutes}m left to book`
  }

  if (remaining.minutes === 0) {
    return `${remaining.hours}h left to book`
  }

  return `${remaining.hours}h ${remaining.minutes}m left to book`
}

/**
 * Filter slots by cut-off time.
 * Removes slots that are within the cut-off window.
 */
export function filterSlotsByCutoff<T extends { slot_date: string; slot_time: string }>(
  slots: T[],
  cutoffHours: number
): T[] {
  return slots.filter(slot => !isSlotWithinCutoff(slot.slot_date, slot.slot_time, cutoffHours))
}

// ================================================
// EXPORTS
// ================================================

export const slotService = {
  // Create
  createSlot,
  createBulkSlots,

  // Read
  getSlotById,
  getAvailableSlots,
  getAllSlots,

  // Update
  updateSlot,

  // Block/Unblock
  blockSlot,
  unblockSlot,

  // Availability
  decrementAvailability,
  incrementAvailability,

  // Delete
  deleteSlot,

  // Cut-off utilities
  isSlotWithinCutoff,
  getTimeUntilCutoff,
  formatCutoffRemaining,
  filterSlotsByCutoff,
}
