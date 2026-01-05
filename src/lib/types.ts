export interface Destination {
  id: string
  name: string
  country: string
  tagline: string
  heroImage: string
  currency: string
  timezone: string
  active: boolean
}

export interface Category {
  id: string
  name: string
  icon: string
  tagline: string
  image: string
}

export interface Provider {
  id: string
  name: string
  photo: string
  bio: string
  since: number
  rating: number
  reviewCount: number
  responseTime: string
  verified: boolean
}

export interface Review {
  id: string
  author: string
  country: string
  date: string
  rating: number
  text: string
  helpful: number
}

export interface MeetingPoint {
  name: string
  address?: string
  lat?: number
  lng?: number
  instructions: string
}

export interface Experience {
  id: string
  title: string
  category: string
  subcategory: string
  destination: string
  provider: Provider
  price: {
    amount: number
    currency: string
    per: string
  }
  duration: string
  startTime?: string
  groupSize: { min: number; max: number }
  difficulty: string
  languages: string[]
  images: string[]
  description: string
  included: string[]
  notIncluded: string[]
  meetingPoint: MeetingPoint
  cancellation: string
  whatToBring: string[]
  reviews: Review[]
  tags?: string[]
}

export interface TripItem {
  experienceId: string
  date?: string
  time?: string
  guests: number
  totalPrice: number
  notes?: string
}

export interface Trip {
  id: string
  userId: string
  destination: string
  startDate?: string
  endDate?: string
  travelers: number
  status: 'planning' | 'booked' | 'active' | 'completed' | 'cancelled'
  items: TripItem[]
  subtotal: number
  serviceFee: number
  total: number
  bookingReference?: string
  bookedAt?: string
  cancelledAt?: string
  cancellationReason?: string
}

export interface Booking {
  id: string
  tripId: string
  reference: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  bookedAt: string
  trip: Trip
}

export interface UserPreferences {
  travelStyle?: 'adventure' | 'relaxation' | 'culture' | 'mix'
  groupType?: 'solo' | 'couple' | 'friends' | 'family'
  budget?: 'budget' | 'midrange' | 'luxury'
}

export interface User {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  preferences: UserPreferences
  saved: string[]
  currency: string
  language: string
  hasCompletedOnboarding?: boolean
}

export interface Vendor {
  id: string
  businessName: string
  businessEmail: string
  ownerFirstName: string
  ownerLastName: string
  phone: string
  sinceYear: number
  verified: boolean
  status: 'pending_verification' | 'active' | 'suspended'
  createdAt: string
  photo?: string
  bio?: string
}

export interface VendorSession {
  vendorId: string
  businessName: string
  verified: boolean
  role: 'vendor'
}

export interface VendorStats {
  totalExperiences: number
  totalBookingsThisMonth: number
  revenueThisMonth: number
  averageRating: number
}

export type FilterType = 'all' | 'beginner' | 'halfday' | 'fullday' | 'private' | 'group' | 'under50' | 'toprated'

/**
 * Discriminated Union for Screen Routing
 * 
 * Type-safe screen navigation without react-router.
 * The 'type' property acts as the discriminant.
 * 
 * Usage Example (Exhaustive Switch):
 * ```typescript
 * function renderScreen(screen: Screen) {
 *   switch (screen.type) {
 *     case 'home':
 *       return <HomeScreen />
 *     case 'category':
 *       return <CategoryScreen categoryId={screen.categoryId} />
 *     case 'experience':
 *       return <ExperienceScreen experienceId={screen.experienceId} />
 *     default:
 *       // TypeScript ensures all cases are handled
 *       const _exhaustive: never = screen
 *       return _exhaustive
 *   }
 * }
 * ```
 */
export type Screen =
  | { type: 'home' }
  | { type: 'category'; categoryId: string }
  | { type: 'experience'; experienceId: string }
  | { type: 'tripBuilder' }
  | { type: 'checkout'; tripId: string }
  | { type: 'explore' }
  | { type: 'saved' }
  | { type: 'profile' }
  | { type: 'bookingDetail'; bookingId: string }
  | { type: 'vendorLogin' }
  | { type: 'vendorRegister' }
  | { type: 'vendorDashboard' }
  | { type: 'vendorExperiences' }
  | { type: 'vendorBookings' }

/**
 * Record Type Examples for Type-Safe Key-Value Mappings
 * 
 * Record<K, V> creates a type with keys of type K and values of type V.
 * Safer than using index signatures [key: string]: T
 * 
 * Usage Example:
 * ```typescript
 * const categoryMap: CategoryMap = {
 *   'water': waterCategory,
 *   'land': landCategory,
 * }
 * 
 * // Type-safe access
 * const category = categoryMap['water'] // Type: Category | undefined
 * const safeCat = category ?? defaultCategory
 * ```
 */
export type CategoryMap = Record<string, Category>
export type ExperienceMap = Record<string, Experience>
export type TripItemsByDate = Record<string, TripItem[]>
