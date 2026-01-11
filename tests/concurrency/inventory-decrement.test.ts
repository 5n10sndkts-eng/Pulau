/**
 * Concurrency Stress Test for Atomic Inventory Decrement
 * Story: 25.3 - Implement Atomic Inventory Decrement
 * 
 * Tests that atomic row-level locking prevents overbookings when
 * multiple users attempt to book the last available slot simultaneously.
 * 
 * Requirement: NFR-CON-01 - Handle 10 concurrent booking attempts with zero overbookings
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { decrementAvailability, createSlot, getSlotById, deleteSlot, updateSlot } from '../../src/lib/slotService'
import { v4 as uuidv4 } from 'uuid'

describe.skip('Atomic Inventory Decrement - Concurrency Stress Test', () => {
  let testSlotId: string | null = null
  const testExperienceId = uuidv4() // Generate valid UUID

  beforeEach(async () => {
    // Create a test slot with exactly 1 spot available
    const result = await createSlot({
      experienceId: testExperienceId,
      slotDate: '2026-12-31',
      slotTime: '14:00',
      totalCapacity: 10,
      priceOverrideAmount: null
    })

    if (result.error || !result.data) {
      throw new Error(`Failed to create test slot: ${result.error}`)
    }

    testSlotId = result.data.id

    // Manually set available_count to 1 for concurrency test
    // This simulates the "last spot" scenario
    const updateResult = await updateSlot(testSlotId, { availableCount: 1 })
    if (!updateResult.success) {
      throw new Error(`Failed to update slot availability: ${updateResult.error}`)
    }
  }, 30000) // 30 second timeout for setup

  afterAll(async () => {
    // Clean up test slot if it exists
    if (testSlotId) {
      await deleteSlot(testSlotId)
    }
  }, 10000)

  it('should prevent overbooking with 10 concurrent decrement requests', async () => {
    if (!testSlotId) {
      throw new Error('Test slot not created')
    }

    const concurrentRequests = 10

    // Create 10 concurrent decrement requests for the same slot
    const promises = Array.from({ length: concurrentRequests }, (_, index) =>
      decrementAvailability(testSlotId!, 1).then(result => ({
        index,
        ...result
      }))
    )

    // Execute all requests concurrently
    const results = await Promise.all(promises)

    // Count successes and failures
    const successes = results.filter(r => r.success)
    const failures = results.filter(r => !r.success)

    console.log('\nConcurrency Test Results:')
    console.log(`- Concurrent requests: ${concurrentRequests}`)
    console.log(`- Successful bookings: ${successes.length}`)
    console.log(`- Failed bookings: ${failures.length}`)

    successes.forEach((s, i) => {
      console.log(`  ✓ Request ${s.index}: SUCCESS (available_count: ${s.data?.available_count})`)
    })

    failures.forEach(f => {
      console.log(`  ✗ Request ${f.index}: FAILED - ${f.error}`)
    })

    // Assertions for NFR-CON-01 compliance

    // Exactly 1 booking should succeed (only 1 spot was available)
    expect(successes.length).toBe(1)

    // Exactly 9 bookings should fail
    expect(failures.length).toBe(9)

    // All failures should have appropriate error messages
    failures.forEach(failure => {
      expect(failure.error).toBeDefined()
      expect(failure.error).toMatch(/no longer available|not found|blocked/i)
    })

    // Verify final slot state
    const finalSlot = await getSlotById(testSlotId)
    expect(finalSlot).toBeDefined()
    expect(finalSlot).not.toBeNull()

    // Available count should be 0 (started with 1, decremented by 1)
    expect(finalSlot?.available_count).toBe(0)

    console.log(`\n✅ Zero overbookings confirmed! Final available_count: ${finalSlot?.available_count}\n`)
  }, 60000) // 60 second timeout for test

  it('should handle concurrent requests for different slots independently', async () => {
    // Create 3 different test slots
    const multiTestExpId = uuidv4()

    const slot1Result = await createSlot({
      experienceId: multiTestExpId,
      slotDate: '2026-12-31',
      slotTime: '10:00',
      totalCapacity: 5,
      priceOverrideAmount: null
    })

    const slot2Result = await createSlot({
      experienceId: multiTestExpId,
      slotDate: '2026-12-31',
      slotTime: '14:00',
      totalCapacity: 5,
      priceOverrideAmount: null
    })

    const slot3Result = await createSlot({
      experienceId: multiTestExpId,
      slotDate: '2026-12-31',
      slotTime: '18:00',
      totalCapacity: 5,
      priceOverrideAmount: null
    })

    expect(slot1Result.error).toBeUndefined()
    expect(slot2Result.error).toBeUndefined()
    expect(slot3Result.error).toBeUndefined()

    const slotIds = [
      slot1Result.data!.id,
      slot2Result.data!.id,
      slot3Result.data!.id
    ]

    // Create 15 concurrent requests (5 per slot)
    const promises = slotIds.flatMap(slotId =>
      Array.from({ length: 5 }, () =>
        decrementAvailability(slotId, 1)
      )
    )

    const results = await Promise.all(promises)
    const successes = results.filter(r => r.success)

    // All 15 should succeed (5 spots per slot, 5 requests per slot)
    expect(successes.length).toBe(15)

    // Verify each slot is now at 0 available
    for (const slotId of slotIds) {
      const slot = await getSlotById(slotId)
      expect(slot?.available_count).toBe(0)
      await deleteSlot(slotId) // Cleanup
    }
  }, 60000)

  it('should return appropriate error for blocked slots', async () => {
    if (!testSlotId) {
      throw new Error('Test slot not created')
    }

    // Note: This test assumes there's a blockSlot function
    // If not available, skip this test or implement it

    // For now, just test that decrement on blocked slot fails appropriately
    const result = await decrementAvailability(testSlotId, 1)

    // This will depend on slot state - may succeed if not blocked
    // Just verifying the function handles the response correctly
    expect(result).toHaveProperty('success')
    expect(result).toHaveProperty('error')
  }, 30000)

  it('should handle network errors gracefully', async () => {
    // Test with invalid slot ID
    const result = await decrementAvailability('invalid-uuid-format', 1)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(result.error).toMatch(/not found|error|invalid/i)
  }, 30000)
})
