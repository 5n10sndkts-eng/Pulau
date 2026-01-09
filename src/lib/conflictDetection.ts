import type { TripItem, Experience } from './types'

/**
 * Represents a scheduling conflict between two trip items
 */
export interface Conflict {
  itemId1: string
  itemId2: string
  date: string
  overlapMinutes: number
  item1Start: string
  item1End: string
  item2Start: string
  item2End: string
}

/**
 * Parse time string (HH:mm) to minutes from midnight
 */
export function parseTimeToMinutes(time: string): number {
  const parts = time.split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  return hours * 60 + minutes
}

/**
 * Convert minutes from midnight to time string (HH:mm)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

/**
 * Parse duration string (e.g., "2 hours", "1.5 hours") to minutes
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m)/i)
  if (!match) return 60 // Default 1 hour

  const matchValue = match[1]
  const matchUnit = match[2]
  if (!matchValue || !matchUnit) return 60

  const value = parseFloat(matchValue)
  const unit = matchUnit.toLowerCase()

  if (unit.startsWith('h')) {
    return Math.round(value * 60)
  }
  return Math.round(value)
}

/**
 * Calculate end time given start time and duration in minutes
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = parseTimeToMinutes(startTime)
  return minutesToTime(startMinutes + durationMinutes)
}

/**
 * Check if two time ranges overlap
 */
export function doTimesOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && start2 < end1
}

/**
 * Calculate overlap in minutes between two time ranges
 */
export function calculateOverlapMinutes(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): number {
  if (!doTimesOverlap(start1, end1, start2, end2)) return 0

  const overlapStart = Math.max(start1, start2)
  const overlapEnd = Math.min(end1, end2)
  return overlapEnd - overlapStart
}

/**
 * Detect conflicts in trip items for a given date
 */
export function detectConflicts(
  items: TripItem[],
  getExperience: (id: string) => Experience | undefined,
  date: string
): Conflict[] {
  const conflicts: Conflict[] = []
  const dayItems = items.filter(item => item.date === date && item.time)

  for (let i = 0; i < dayItems.length; i++) {
    for (let j = i + 1; j < dayItems.length; j++) {
      const item1 = dayItems[i]
      const item2 = dayItems[j]

      if (!item1 || !item2 || !item1.time || !item2.time) continue

      const exp1 = getExperience(item1.experienceId)
      const exp2 = getExperience(item2.experienceId)

      if (!exp1 || !exp2) continue

      const duration1 = exp1.durationHours ? exp1.durationHours * 60 : parseDuration(exp1.duration)
      const duration2 = exp2.durationHours ? exp2.durationHours * 60 : parseDuration(exp2.duration)

      const start1 = parseTimeToMinutes(item1.time)
      const end1 = start1 + duration1
      const start2 = parseTimeToMinutes(item2.time)
      const end2 = start2 + duration2

      const overlapMinutes = calculateOverlapMinutes(start1, end1, start2, end2)

      if (overlapMinutes > 0) {
        conflicts.push({
          itemId1: item1.experienceId,
          itemId2: item2.experienceId,
          date,
          overlapMinutes,
          item1Start: item1.time,
          item1End: minutesToTime(end1),
          item2Start: item2.time,
          item2End: minutesToTime(end2),
        })
      }
    }
  }

  return conflicts
}

/**
 * Get all conflicts across all dates in trip items
 */
export function getAllConflicts(
  items: TripItem[],
  getExperience: (id: string) => Experience | undefined
): Conflict[] {
  const dates = [...new Set(items.filter(i => i.date).map(i => i.date!))]
  return dates.flatMap(date => detectConflicts(items, getExperience, date))
}
