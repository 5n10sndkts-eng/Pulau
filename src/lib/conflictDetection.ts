import type { TripItem, Experience } from './types'

export interface Conflict {
  conflictId: string
  itemIds: [string, string]
  overlapMinutes: number
  date: string
}

export const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export const parseDuration = (duration: string): number => {
  const hourMatch = duration.match(/(\d+\.?\d*)\s*h/)
  if (hourMatch) {
    return parseFloat(hourMatch[1])
  }
  return 2
}

export const calculateEndTime = (startTime: string, durationHours: number): string => {
  const startMinutes = parseTimeToMinutes(startTime)
  const endMinutes = startMinutes + Math.round(durationHours * 60)
  return minutesToTime(endMinutes)
}

export const isOverlapping = (
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean => {
  return end1 > start2 && start1 < end2
}

const groupItemsByDate = (items: TripItem[]): Record<string, TripItem[]> => {
  const grouped: Record<string, TripItem[]> = {}
  items.forEach(item => {
    if (item.date) {
      if (!grouped[item.date]) {
        grouped[item.date] = []
      }
      grouped[item.date].push(item)
    }
  })
  return grouped
}

export const detectConflicts = (
  items: TripItem[],
  getExperience: (id: string) => Experience | undefined
): Conflict[] => {
  const conflicts: Conflict[] = []
  const itemsByDay = groupItemsByDate(items)

  Object.entries(itemsByDay).forEach(([date, dayItems]) => {
    const itemsWithTime = dayItems.filter(item => item.time)

    for (let i = 0; i < itemsWithTime.length; i++) {
      for (let j = i + 1; j < itemsWithTime.length; j++) {
        const itemA = itemsWithTime[i]
        const itemB = itemsWithTime[j]
        const expA = getExperience(itemA.experienceId)
        const expB = getExperience(itemB.experienceId)

        if (!expA || !expB || !itemA.time || !itemB.time) continue

        const durationA = parseDuration(expA.duration)
        const durationB = parseDuration(expB.duration)

        const startA = parseTimeToMinutes(itemA.time)
        const endA = startA + Math.round(durationA * 60)
        const startB = parseTimeToMinutes(itemB.time)
        const endB = startB + Math.round(durationB * 60)

        if (isOverlapping(startA, endA, startB, endB)) {
          const overlapStart = Math.max(startA, startB)
          const overlapEnd = Math.min(endA, endB)
          const overlapMinutes = overlapEnd - overlapStart

          conflicts.push({
            conflictId: `${itemA.experienceId}-${itemB.experienceId}-${date}`,
            itemIds: [itemA.experienceId, itemB.experienceId],
            overlapMinutes,
            date,
          })
        }
      }
    }
  })

  return conflicts
}
