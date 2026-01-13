import { Experience, FilterType, TripItem, Booking } from './types';
import { experiences } from './mockData';

export function getExperiencesByCategory(
  categoryId: string,
  pool: Experience[] = experiences,
): Experience[] {
  return pool.filter((exp) => exp.category === categoryId);
}

export function getExperienceById(
  id: string,
  pool: Experience[] = experiences,
): Experience | undefined {
  return pool.find((exp) => exp.id === id);
}

export function filterExperiences(
  exps: Experience[],
  filter: FilterType,
): Experience[] {
  if (filter === 'all') return exps;

  return exps.filter((exp) => {
    if (filter === 'under50') return exp.price.amount < 50;
    if (filter === 'toprated') return exp.provider.rating >= 4.8;
    if (filter === 'instant') return exp.provider.instantBookEnabled === true;
    if (!exp.tags) return false;
    return exp.tags.includes(filter);
  });
}

/**
 * Enhanced search with weighted relevance
 */
export function searchExperiences(
  query: string,
  pool: Experience[],
): Experience[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return pool;

  return pool
    .map((exp) => {
      let score = 0;
      const title = exp.title.toLowerCase();
      const desc = exp.description.toLowerCase();
      const category = exp.category.toLowerCase();

      // Exact title match (highest weight)
      if (title === normalizedQuery)
        score += 20; // Boost exact match
      else if (title.includes(normalizedQuery)) score += 10;
      // Category match
      if (category.includes(normalizedQuery)) score += 8;
      // Search term at start of title
      if (title.startsWith(normalizedQuery)) score += 5;
      // Description match
      if (desc.includes(normalizedQuery)) score += 3;

      return { exp, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.exp);
}

/**
 * Multi-criteria filter engine
 */
export function filterExperiencesAdvanced(
  exps: Experience[],
  criteria: {
    difficulty?: string[];
    duration?: string[]; // 'half', 'full'
    priceRange?: [number, number];
  },
): Experience[] {
  return exps.filter((exp) => {
    // 1. Difficulty
    if (criteria.difficulty && criteria.difficulty.length > 0) {
      if (!criteria.difficulty.includes(exp.difficulty.toLowerCase()))
        return false;
    }

    // 2. Duration
    if (criteria.duration && criteria.duration.length > 0) {
      const isFull =
        exp.duration.toLowerCase().includes('full') || exp.durationHours! >= 6;
      const type = isFull ? 'full' : 'half';
      if (!criteria.duration.includes(type)) return false;
    }

    // 3. Price
    if (criteria.priceRange) {
      const [min, max] = criteria.priceRange;
      if (exp.price.amount < min || exp.price.amount > max) return false;
    }

    return true;
  });
}

export function calculateTripTotal(items: TripItem[]): {
  subtotal: number;
  serviceFee: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const serviceFee = subtotal * 0.05;
  const total = subtotal + serviceFee;

  return { subtotal, serviceFee, total };
}

export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return 'Set your dates';

  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`;
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export function getDayLabel(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function getRecommendedExperiences(
  categoryId: string,
  travelStyles?: string[],
  groupType?: string,
  pool: Experience[] = experiences,
): Experience[] {
  const categoryExps = getExperiencesByCategory(categoryId, pool);

  return categoryExps.filter((exp) => {
    if (
      travelStyles?.includes('relaxation') &&
      categoryId === 'water_adventures'
    ) {
      return exp.tags?.includes('beginner') || exp.subcategory === 'snorkeling';
    }
    if (
      travelStyles?.includes('adventure') &&
      categoryId === 'land_explorations'
    ) {
      return exp.difficulty === 'Moderate';
    }
    if (groupType === 'couple' && categoryId === 'food_nightlife') {
      return exp.tags?.includes('private') || exp.subcategory === 'cruise';
    }
    return true;
  });
}

// Enhanced recommendation with scoring
export interface PreferenceSection {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  experiences: Experience[];
}

export function scoreExperienceForPreferences(
  exp: Experience,
  travelStyles?: string[],
  groupType?: string,
  budget?: string,
): number {
  let score = 0;

  // Budget matching
  if (budget === 'budget' && exp.price.amount < 50) score += 3;
  if (budget === 'midrange' && exp.price.amount >= 50 && exp.price.amount < 100)
    score += 3;
  if (budget === 'luxury' && exp.price.amount >= 100) score += 3;

  // Group type matching
  if (groupType === 'solo' && exp.groupSize.min === 1) score += 2;
  if (
    groupType === 'couple' &&
    (exp.tags?.includes('private') || exp.groupSize.max <= 4)
  )
    score += 2;
  if (groupType === 'friends' && exp.tags?.includes('group')) score += 2;
  if (groupType === 'family' && exp.difficulty === 'Easy') score += 2;

  // Travel style matching
  if (
    travelStyles?.includes('adventure') &&
    (exp.difficulty === 'Moderate' || exp.category === 'land_explorations')
  )
    score += 3;
  if (
    travelStyles?.includes('relaxation') &&
    (exp.tags?.includes('beginner') || exp.category === 'stays')
  )
    score += 3;
  if (
    travelStyles?.includes('culture') &&
    exp.category === 'culture_experiences'
  )
    score += 3;
  if (
    travelStyles?.includes('wellness') &&
    (exp.tags?.includes('yoga') ||
      exp.tags?.includes('spa') ||
      exp.tags?.includes('wellness'))
  )
    score += 3;

  // Boost top-rated
  if (exp.provider.rating >= 4.8) score += 2;
  if (exp.provider.rating >= 4.9) score += 1;

  return score;
}

export function getPersonalizedExperiences(
  travelStyles?: string[],
  groupType?: string,
  budget?: string,
  limit = 6,
  pool: Experience[] = experiences,
): Experience[] {
  const scored = pool.map((exp) => ({
    experience: exp,
    score: scoreExperienceForPreferences(exp, travelStyles, groupType, budget),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.experience);
}

export function getPreferenceBasedSections(
  travelStyles?: string[],
  groupType?: string,
  budget?: string,
  pool: Experience[] = experiences,
): PreferenceSection[] {
  const sections: PreferenceSection[] = [];

  // Perfect for You (always show if any preferences set)
  if ((travelStyles && travelStyles.length > 0) || groupType || budget) {
    sections.push({
      id: 'perfect_for_you',
      title: 'Perfect for You',
      subtitle: 'Based on your preferences',
      emoji: '✨',
      experiences: getPersonalizedExperiences(
        travelStyles,
        groupType,
        budget,
        4,
        pool,
      ),
    });
  }

  // Group type specific sections
  if (groupType === 'solo') {
    sections.push({
      id: 'solo_adventures',
      title: 'Great for Solo Travelers',
      subtitle: 'No minimum group size required',
      emoji: '🎒',
      experiences: pool.filter((exp) => exp.groupSize.min === 1).slice(0, 4),
    });
  }

  if (groupType === 'couple') {
    sections.push({
      id: 'romantic_escapes',
      title: 'Romantic Escapes',
      subtitle: 'Perfect for couples',
      emoji: '💕',
      experiences: pool
        .filter(
          (exp) => exp.tags?.includes('private') || exp.groupSize.max <= 4,
        )
        .slice(0, 4),
    });
  }

  if (groupType === 'friends') {
    sections.push({
      id: 'group_adventures',
      title: 'Fun with Friends',
      subtitle: 'Group-friendly experiences',
      emoji: '👥',
      experiences: pool
        .filter((exp) => exp.tags?.includes('group') || exp.groupSize.max >= 6)
        .slice(0, 4),
    });
  }

  if (groupType === 'family') {
    sections.push({
      id: 'family_friendly',
      title: 'Family-Friendly Fun',
      subtitle: 'Great for all ages',
      emoji: '👨‍👩‍👧',
      experiences: experiences
        .filter(
          (exp) => exp.difficulty === 'Easy' || exp.tags?.includes('beginner'),
        )
        .slice(0, 4),
    });
  }

  // Budget sections
  if (budget === 'budget') {
    sections.push({
      id: 'budget_picks',
      title: 'Budget-Friendly Picks',
      subtitle: 'Great experiences under $50',
      emoji: '💰',
      experiences: pool
        .filter((exp) => exp.price.amount < 50)
        .sort((a, b) => a.price.amount - b.price.amount)
        .slice(0, 4),
    });
  }

  if (budget === 'luxury') {
    sections.push({
      id: 'luxury_experiences',
      title: 'Luxury Experiences',
      subtitle: 'Premium adventures',
      emoji: '💎',
      experiences: pool
        .filter((exp) => exp.price.amount >= 80)
        .sort((a, b) => b.provider.rating - a.provider.rating)
        .slice(0, 4),
    });
  }

  // Travel style sections
  if (travelStyles?.includes('adventure')) {
    sections.push({
      id: 'adventure_calls',
      title: 'Adventure Awaits',
      subtitle: 'For thrill seekers',
      emoji: '⛰️',
      experiences: pool
        .filter(
          (exp) =>
            exp.difficulty === 'Moderate' ||
            exp.category === 'land_explorations' ||
            exp.category === 'water_adventures',
        )
        .slice(0, 4),
    });
  }

  if (travelStyles?.includes('relaxation')) {
    sections.push({
      id: 'relaxation_mode',
      title: 'Relax & Unwind',
      subtitle: 'Take it easy',
      emoji: '🌴',
      experiences: experiences
        .filter(
          (exp) => exp.difficulty === 'Easy' || exp.tags?.includes('beginner'),
        )
        .slice(0, 4),
    });
  }

  if (travelStyles?.includes('culture')) {
    sections.push({
      id: 'cultural_immersion',
      title: 'Cultural Immersion',
      subtitle: 'Discover local traditions',
      emoji: '🏛️',
      experiences: pool
        .filter((exp) => exp.category === 'culture_experiences')
        .slice(0, 4),
    });
  }

  if (travelStyles?.includes('wellness')) {
    sections.push({
      id: 'wellness_retreats',
      title: 'Wellness & Zen',
      subtitle: 'Mindful Bali experiences',
      emoji: '🧘',
      experiences: pool
        .filter(
          (exp) =>
            exp.tags?.includes('yoga') ||
            exp.tags?.includes('spa') ||
            exp.tags?.includes('wellness'),
        )
        .slice(0, 4),
    });
  }

  return sections;
}

export function generateTripFromPreferences(
  preferences: import('./types').UserPreferences,
  dates?: { start: string; end: string },
): import('./types').Trip {
  // 1. Get personalized recommendations based on weighted scoring
  const recommendedExperiences = getPersonalizedExperiences(
    preferences.travelStyles,
    preferences.groupType,
    preferences.budget,
    10, // Get top 10 candidates
    experiences, // Use default mock pool for trip generation for now, or update this signature to accept pool if needed
  );

  // 2. Select 3-4 distinct experiences to avoid repetition
  // Simple heuristic: Take top 3 unique categories if possible
  const selectedExperiences: Experience[] = [];
  const usedCategories = new Set<string>();

  for (const exp of recommendedExperiences) {
    if (selectedExperiences.length >= 4) break;

    // Try to diversify categories, but fill up if needed
    if (!usedCategories.has(exp.category) || selectedExperiences.length < 2) {
      selectedExperiences.push(exp);
      usedCategories.add(exp.category);
    }
  }

  // If we still don't have enough, just take from the top
  if (selectedExperiences.length < 3) {
    for (const exp of recommendedExperiences) {
      if (!selectedExperiences.find((e) => e.id === exp.id)) {
        selectedExperiences.push(exp);
        if (selectedExperiences.length >= 3) break;
      }
    }
  }

  // 3. Create trip items
  const items: TripItem[] = selectedExperiences.map((exp, index) => {
    // Basic day scheduling logic if dates provided
    let itemDate = undefined;
    if (dates) {
      const start = new Date(dates.start);
      // Spread activities over days (Day 1, Day 2...)
      const scheduleDate = new Date(start);
      scheduleDate.setDate(start.getDate() + (index % 3));
      itemDate = scheduleDate.toISOString().split('T')[0];
    }

    return {
      experienceId: exp.id,
      guests: 2, // Default to 2 for now, or match group type logic
      totalPrice: exp.price.amount * 2,
      date: itemDate,
      time: exp.duration.includes('Full Day') ? '09:00' : '10:00', // Default start times
    };
  });

  // 4. Calculate totals
  const { subtotal, serviceFee, total } = calculateTripTotal(items);

  return {
    id: `trip_${Date.now()}`,
    userId: 'user_demo', // Will be overwritten if logged in
    destination: 'dest_bali',
    startDate: dates?.start,
    endDate: dates?.end,
    travelers: 2,
    status: 'planning',
    items,
    subtotal,
    serviceFee,
    total,
  };
}

export function generateBookingReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PUL-2025-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateDemoBookings(): Booking[] {
  const now = new Date();
  const pastDate1 = new Date(now);
  pastDate1.setDate(now.getDate() - 60);
  const pastDate2 = new Date(now);
  pastDate2.setDate(now.getDate() - 30);

  const futureDate1 = new Date(now);
  futureDate1.setDate(now.getDate() + 30);
  const futureDate2 = new Date(now);
  futureDate2.setDate(now.getDate() + 60);

  return [
    {
      id: 'booking_demo_1',
      tripId: 'trip_demo_1',
      reference: 'PUL-2025-A7B3C',
      status: 'confirmed' as const,
      bookedAt: new Date(
        now.getTime() - 15 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      trip: {
        id: 'trip_demo_1',
        userId: 'user_demo',
        destination: 'dest_bali',
        startDate: futureDate1.toISOString().split('T')[0],
        endDate: new Date(futureDate1.getTime() + 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        travelers: 2,
        status: 'booked' as const,
        bookingReference: 'PUL-2025-A7B3C',
        bookedAt: new Date(
          now.getTime() - 15 * 24 * 60 * 60 * 1000,
        ).toISOString(),
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
            date: new Date(futureDate1.getTime() + 1 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            time: '02:00',
            guests: 2,
            totalPrice: 110,
          },
          {
            experienceId: 'exp_003',
            date: new Date(futureDate1.getTime() + 2 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
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
      bookedAt: new Date(
        pastDate1.getTime() - 10 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      trip: {
        id: 'trip_demo_2',
        userId: 'user_demo',
        destination: 'dest_bali',
        startDate: pastDate2.toISOString().split('T')[0],
        endDate: new Date(pastDate2.getTime() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        travelers: 2,
        status: 'completed' as const,
        bookingReference: 'PUL-2025-X9K2M',
        bookedAt: new Date(
          pastDate1.getTime() - 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
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
            date: new Date(pastDate2.getTime() + 2 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
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
  ];
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
  };
  return flags[countryCode] || '🌍';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export interface Conflict {
  itemA: TripItem;
  itemB: TripItem;
  message: string;
}

export function checkForConflicts(items: TripItem[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const itemsWithTime = items.filter(
    (i): i is TripItem & { date: string; time: string } => !!i.date && !!i.time,
  );

  for (let i = 0; i < itemsWithTime.length; i++) {
    for (let j = i + 1; j < itemsWithTime.length; j++) {
      const itemA = itemsWithTime[i]!;
      const itemB = itemsWithTime[j]!;

      if (itemA.date !== itemB.date) continue;

      const expA = getExperienceById(itemA.experienceId, experiences);
      const expB = getExperienceById(itemB.experienceId, experiences);
      if (!expA || !expB) continue;

      const durationA = expA.duration.includes('Full') ? 8 : 2;
      const durationB = expB.duration.includes('Full') ? 8 : 2;

      const [hoursA, minsA] = itemA.time.split(':');
      const startA = parseInt(hoursA ?? '0') + parseInt(minsA ?? '0') / 60;
      const endA = startA + durationA;

      const [hoursB, minsB] = itemB.time.split(':');
      const startB = parseInt(hoursB ?? '0') + parseInt(minsB ?? '0') / 60;
      const endB = startB + durationB;

      if (startA < endB && startB < endA) {
        conflicts.push({
          itemA,
          itemB,
          message: `Overlap detected between "${truncateText(expA.title, 20)}" and "${truncateText(expB.title, 20)}"`,
        });
      }
    }
  }
  return conflicts;
}

export function findNextAvailableSlot(
  items: TripItem[],
  date: string,
  durationHours: number = 2,
): string | null {
  const existingItems = items.filter(
    (i): i is TripItem & { date: string; time: string } =>
      i.date === date && !!i.time,
  );

  for (let hour = 8; hour <= 18; hour++) {
    const slotStart = hour;
    const slotEnd = hour + durationHours;

    const hasOverlap = existingItems.some((item) => {
      const exp = getExperienceById(item.experienceId, experiences);
      const itemDur = exp?.duration.includes('Full') ? 8 : 2;
      const [hrs, mins] = item.time.split(':');
      const itemStart = parseInt(hrs ?? '0') + parseInt(mins ?? '0') / 60;
      const itemEnd = itemStart + itemDur;

      return slotStart < itemEnd && itemStart < slotEnd;
    });

    if (!hasOverlap) {
      return `${hour.toString().padStart(2, '0')}:00`;
    }
  }

  return null;
}
