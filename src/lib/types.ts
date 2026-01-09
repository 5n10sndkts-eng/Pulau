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

// --- Enums ---
export enum ExperienceCategory {
  WaterAdventures = 'water_adventures',
  LandExplorations = 'land_explorations',
  CultureExperiences = 'culture_experiences',
  FoodNightlife = 'food_nightlife',
  Transportation = 'transportation',
  Stays = 'stays'
}

export enum ExperienceStatus {
  Draft = 'draft',
  Active = 'active',
  Inactive = 'inactive',
  SoldOut = 'sold_out'
}

export enum Difficulty {
  Easy = 'Easy',
  Moderate = 'Moderate',
  Challenging = 'Challenging'
}

export enum PricePer {
  Person = 'person',
  Vehicle = 'vehicle',
  Group = 'group'
}

export interface Category {
  id: ExperienceCategory | string
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
  category: ExperienceCategory | string
  subcategory: string
  destination: string // destination_id or object
  provider: Provider // vendor_id or hydrated object
  price: {
    amount: number
    currency: string
    per: PricePer | string
  }
  duration: string // formatted string "2 hours"
  durationHours?: number // numeric for DB
  startTime?: string
  groupSize: { min: number; max: number }
  difficulty: Difficulty | string
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
  status?: ExperienceStatus | 'draft' | 'active' | 'inactive'
  vendorId?: string
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

// --- Database Schema Records (Story 5.1) ---

export interface ExperienceRecord {
  id: string
  vendorId: string
  title: string
  category: ExperienceCategory
  subcategory: string
  destinationId: string
  description: string
  priceAmount: number
  priceCurrency: string
  pricePer: PricePer
  durationHours: number
  startTime?: string // HH:mm
  groupSizeMin: number
  groupSizeMax: number
  difficulty: Difficulty
  languages: string[]
  status: ExperienceStatus
  meetingPointName?: string
  meetingPointAddress?: string
  meetingPointLat?: number
  meetingPointLng?: number
  meetingPointInstructions?: string
  cancellationPolicy?: string
  createdAt: string
  updatedAt: string
}

export interface ExperienceImageRecord {
  id: string
  experienceId: string
  imageUrl: string
  displayOrder: number
  createdAt: string
}

export interface ExperienceInclusionRecord {
  id: string
  experienceId: string
  itemText: string
  isIncluded: boolean // true = included, false = excluded/what to bring
  createdAt: string
}

export interface ExperienceAvailabilityRecord {
  id: string
  experienceId: string
  date: string // YYYY-MM-DD
  slotsAvailable: number
  status: 'available' | 'blocked' | 'sold_out'
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
  shareToken?: string
  name?: string
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
  travelStyles?: ('adventure' | 'relaxation' | 'culture' | 'wellness')[]
  groupType?: 'solo' | 'couple' | 'friends' | 'family'
  budget?: 'budget' | 'midrange' | 'luxury'
  destinationId?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  firstName?: string
  lastName?: string
  preferences?: UserPreferences
  saved?: string[]
  currency?: string
  language?: string

  hasCompletedOnboarding?: boolean
  emailVerified?: boolean
  createdAt?: string
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
  rating?: number
  reviewCount?: number
  responseTime?: string
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
  | { type: 'trip' }
  | { type: 'tripDetail'; tripId: string }
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
  | { type: 'vendorExperienceEdit'; experienceId: string }
  | { type: 'vendorExperienceCreate' }
  | { type: 'vendorExperienceImages'; experienceId: string }
  | { type: 'vendorExperienceAvailability'; experienceId: string }
  | { type: 'customerLogin' }
  | { type: 'customerRegister' }
  | { type: 'passwordReset' }
  | { type: 'onboarding' }
  | { type: 'trips' }

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

export interface PaymentMethod {
  id: string
  userId: string
  paymentToken: string
  lastFour: string
  cardBrand: 'visa' | 'mastercard' | 'amex' | 'discover'
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
  cardholderName: string
  createdAt: string
  deletedAt?: string
}

export interface ExperienceAvailability {
  id: string
  experienceId: string
  date: string
  slotsAvailable: number
  slotsTotal: number
  status: 'available' | 'blocked'
}
