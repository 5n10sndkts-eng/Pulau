/**
 * Null Safety Utilities and Patterns
 * 
 * TypeScript strict mode patterns for handling null/undefined values safely.
 * All utilities follow the principle: explicit is better than implicit.
 */

/**
 * Safely get nested property with type safety
 * 
 * Usage:
 * ```typescript
 * const name = safeGet(user, 'profile', 'name') ?? 'Anonymous'
 * ```
 */
export function safeGet<T, K1 extends keyof T>(
  obj: T | null | undefined,
  key1: K1
): T[K1] | undefined

export function safeGet<T, K1 extends keyof T, K2 extends keyof T[K1]>(
  obj: T | null | undefined,
  key1: K1,
  key2: K2
): T[K1][K2] | undefined

export function safeGet<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2]
>(
  obj: T | null | undefined,
  key1: K1,
  key2: K2,
  key3: K3
): T[K1][K2][K3] | undefined

export function safeGet(obj: unknown, ...keys: string[]): unknown {
  if (!obj) return undefined
  return keys.reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

/**
 * Optional Chaining Examples
 * 
 * Use `?.` for safe property access on potentially null/undefined values:
 * ```typescript
 * const username = user?.profile?.name
 * const firstReview = experience?.reviews?.[0]
 * const providerBio = experience?.provider?.bio
 * ```
 */

/**
 * Nullish Coalescing Examples
 * 
 * Use `??` to provide default values (only for null/undefined, not falsy values):
 * ```typescript
 * const displayName = user?.firstName ?? 'Guest'
 * const travelers = trip?.travelers ?? 1
 * const price = item?.totalPrice ?? 0
 * ```
 */

/**
 * Spark useKV Null Handling Pattern
 * 
 * CRITICAL: useKV can return null even with a default value!
 * Always provide a defensive fallback:
 * 
 * ```typescript
 * import { useKV } from '@github/spark/hooks'
 * 
 * const defaultTrip: Trip = { ... }
 * const [trip, setTrip] = useKV<Trip>('pulau_trip', defaultTrip)
 * 
 * // WRONG: Assuming trip is never null
 * const totalPrice = trip.total // Type error!
 * 
 * // CORRECT: Defensive null check
 * const safeTrip = trip ?? defaultTrip
 * const totalPrice = safeTrip.total
 * 
 * // CORRECT: useKV updater with null check
 * setTrip((current) => {
 *   const base = current ?? defaultTrip
 *   return { ...base, travelers: 2 }
 * })
 * ```
 */

/**
 * Type Guard for runtime type checking
 * 
 * Usage:
 * ```typescript
 * function isExperience(value: unknown): value is Experience {
 *   return typeof value === 'object' && value !== null && 'id' in value && 'title' in value
 * }
 * 
 * if (isExperience(data)) {
 *   // TypeScript knows data is Experience here
 *   console.log(data.title)
 * }
 * ```
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Filter out null/undefined from arrays
 * 
 * Usage:
 * ```typescript
 * const experiences: (Experience | null)[] = [exp1, null, exp2, undefined, exp3]
 * const validExperiences: Experience[] = experiences.filter(isDefined)
 * ```
 */
export function filterDefined<T>(array: (T | null | undefined)[]): T[] {
  return array.filter(isDefined)
}

/**
 * Assert value is not null/undefined
 * Throws error if value is null/undefined
 * 
 * Usage:
 * ```typescript
 * const experience = getExperienceById(id)
 * assertDefined(experience, `Experience ${id} not found`)
 * // TypeScript knows experience is Experience (not undefined) after this line
 * ```
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message ?? 'Value must be defined')
  }
}
