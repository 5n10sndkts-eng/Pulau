import { Experience, FilterType, TripItem, Booking } from './types'
import { experiences } from './mockData'

export function getExperiencesByCategory(categoryId: string): Experience[] {
  return experiences.filter((exp) => exp.category === categoryId)
}

export function getExperienceById(id: string): Experience | undefined {
  return experiences.find((exp) => exp.id === id)
}

export function filterExperiences(exps: Experience[], filter: FilterType): Experience[] {
  if (filter === 'all') return exps

  return exps.filter((exp) => {
    if (!exp.tags) return false
    return exp.tags.includes(filter)
  })
}

export function calculateTripTotal(items: TripItem[]): { subtotal: number; serviceFee: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const serviceFee = subtotal * 0.05
  const total = subtotal + serviceFee

  return { subtotal, serviceFee, total }
}

export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return 'Set your dates'
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
  const startDay = start.getDate()
  const endDay = end.getDate()
  const year = end.getFullYear()
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`
  }
  
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
}

export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

export function getDayLabel(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function getRecommendedExperiences(
  categoryId: string,
  travelStyle?: string,
  groupType?: string
): Experience[] {
  const categoryExps = getExperiencesByCategory(categoryId)
  
  return categoryExps.filter((exp) => {
    if (travelStyle === 'relaxation' && categoryId === 'water_adventures') {
      return exp.tags?.includes('beginner') || exp.subcategory === 'snorkeling'
    }
    if (travelStyle === 'adventure' && categoryId === 'land_explorations') {
      return exp.difficulty === 'Moderate'
    }
    if (groupType === 'couple' && categoryId === 'food_nightlife') {
      return exp.tags?.includes('private') || exp.subcategory === 'cruise'
    }
    return true
  })
}

export function generateBookingReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'PUL-2025-'
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateDemoBookings(): Booking[] {
  const now = new Date()
  const pastDate1 = new Date(now)
  pastDate1.setDate(now.getDate() - 60)
  const pastDate2 = new Date(now)
  pastDate2.setDate(now.getDate() - 30)
  
  const futureDate1 = new Date(now)
  futureDate1.setDate(now.getDate() + 30)
  const futureDate2 = new Date(now)
  futureDate2.setDate(now.getDate() + 60)

  return [
    {
      id: 'booking_demo_1',
      tripId: 'trip_demo_1',
      reference: 'PUL-2025-A7B3C',
      status: 'confirmed' as const,
      bookedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      trip: {
        id: 'trip_demo_1',
        userId: 'user_demo',
        destination: 'dest_bali',
        startDate: futureDate1.toISOString().split('T')[0],
        endDate: new Date(futureDate1.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        travelers: 2,
        status: 'booked' as const,
        bookingReference: 'PUL-2025-A7B3C',
        bookedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            experienceId: 'exp_001',
            date: futureDate1.toISOString().split('T')[0],
            time: '05:00',
            guests: 2,
            totalPrice: 130,
          },
          {
            experienceId: 'exp_002',
            date: new Date(futureDate1.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '02:00',
            guests: 2,
            totalPrice: 110,
          },
          {
            experienceId: 'exp_003',
            date: new Date(futureDate1.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '08:00',
            guests: 2,
            totalPrice: 90,
          },
        ],
        subtotal: 330,
        serviceFee: 16.5,
        total: 346.5,
      },
    },
    {
      id: 'booking_demo_2',
      tripId: 'trip_demo_2',
      reference: 'PUL-2025-X9K2M',
      status: 'completed' as const,
      bookedAt: new Date(pastDate1.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      trip: {
        id: 'trip_demo_2',
        userId: 'user_demo',
        destination: 'dest_bali',
        startDate: pastDate2.toISOString().split('T')[0],
        endDate: new Date(pastDate2.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        travelers: 2,
        status: 'completed' as const,
        bookingReference: 'PUL-2025-X9K2M',
        bookedAt: new Date(pastDate1.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            experienceId: 'exp_004',
            date: pastDate2.toISOString().split('T')[0],
            time: '14:00',
            guests: 2,
            totalPrice: 25,
          },
          {
            experienceId: 'exp_001',
            date: new Date(pastDate2.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '05:00',
            guests: 2,
            totalPrice: 130,
          },
        ],
        subtotal: 155,
        serviceFee: 7.75,
        total: 162.75,
      },
    },
  ]
}

export function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    AU: '🇦🇺',
    US: '🇺🇸',
    UK: '🇬🇧',
    CA: '🇨🇦',
    DE: '🇩🇪',
    FR: '🇫🇷',
    NZ: '🇳🇿',
    SG: '🇸🇬',
    NL: '🇳🇱',
    ES: '🇪🇸',
    IT: '🇮🇹',
    RU: '🇷🇺',
  }
  return flags[countryCode] || '🌍'
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
