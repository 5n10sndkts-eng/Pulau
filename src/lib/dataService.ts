import { supabase, isSupabaseConfigured } from './supabase';
import {
  Experience,
  ExperienceStatus,
  Difficulty,
  PricePer,
  Provider,
} from './types';
import { experiences as mockExperiences } from './mockData';

// Use mock data if:
// 1. VITE_USE_MOCK_DATA is explicitly set to 'true', OR
// 2. Supabase is not configured (no valid credentials)
const USE_MOCK_DATA =
  import.meta.env.VITE_USE_MOCK_DATA === 'true' || !isSupabaseConfigured();

// ================================================
// Database Record Types (for Supabase query results)
// ================================================

interface DBVendor {
  id: string;
  business_name: string | null;
  photo: string | null;
  bio: string | null;
  since_year: number | null;
  rating: number | null;
  review_count: number | null;
  response_time: string | null;
  verified: boolean | null;
  created_at: string | null;
  instant_book_enabled: boolean | null;
}

interface DBExperienceImage {
  id: string;
  image_url: string;
  display_order: number | null;
}

interface DBExperienceInclusion {
  id: string;
  item_text: string;
  inclusion_type: string; // Supabase returns string, we filter by literal values
  display_order: number | null;
}

interface DBReview {
  id: string;
  author_name: string | null;
  country: string | null;
  rating: number;
  text: string | null;
  helpful_count: number | null;
  created_at: string;
}

interface DBExperienceRecord {
  id: string;
  title: string;
  category: string;
  subcategory: string | null;
  destination_id: string | null;
  vendor_id: string;
  price_amount: number;
  price_currency: string | null;
  price_per: string | null;
  duration_hours: number | null;
  start_time: string | null;
  group_size_min: number | null;
  group_size_max: number | null;
  difficulty: string | null;
  languages: string[] | null;
  description: string | null;
  meeting_point_name: string | null;
  meeting_point_address: string | null;
  meeting_point_lat: number | null;
  meeting_point_lng: number | null;
  meeting_point_instructions: string | null;
  cancellation_policy: string | null;
  tags: string[] | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
  published_at: string | null;
  // Joined relations
  vendors: DBVendor | null;
  experience_images: DBExperienceImage[] | null;
  experience_inclusions: DBExperienceInclusion[] | null;
  reviews: DBReview[] | null;
}

/**
 * Helper to convert DB Record to UI Experience.
 * Exported for use by vendorService to avoid code duplication.
 */
export function toExperience(record: DBExperienceRecord): Experience {
  // Map vendor data from join
  const vendor = record.vendors;
  const provider: Provider = {
    id: record.vendor_id || 'unknown',
    name: vendor?.business_name || 'Unknown Vendor',
    photo: vendor?.photo || 'https://via.placeholder.com/150',
    bio: vendor?.bio || '',
    since:
      vendor?.since_year ||
      (vendor?.created_at ? new Date(vendor.created_at).getFullYear() : 2024),
    rating: vendor?.rating || 5.0,
    reviewCount: vendor?.review_count || 0,
    responseTime: vendor?.response_time || 'within 24 hours',
    verified: vendor?.verified || false,
  };

  // Map images from join (sorted by display_order)
  const images = (record.experience_images || [])
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map((img) => img.image_url);

  // Map inclusions from join
  const inclusions = record.experience_inclusions || [];
  const included = inclusions
    .filter((i) => i.inclusion_type === 'included')
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map((i) => i.item_text);
  const notIncluded = inclusions
    .filter((i) => i.inclusion_type === 'not_included')
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map((i) => i.item_text);
  const whatToBring = inclusions
    .filter((i) => i.inclusion_type === 'what_to_bring')
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map((i) => i.item_text);

  // Map reviews from join
  const reviews = (record.reviews || []).map((r) => ({
    id: r.id,
    author: r.author_name || 'Anonymous',
    country: r.country || '',
    date: r.created_at,
    rating: r.rating,
    text: r.text || '',
    helpful: r.helpful_count || 0,
  }));

  // Format duration string
  const durationHours = Number(record.duration_hours) || 2;
  const durationStr =
    durationHours >= 1
      ? `${durationHours} ${durationHours === 1 ? 'hour' : 'hours'}`
      : `${Math.round(durationHours * 60)} minutes`;

  return {
    id: record.id,
    title: record.title,
    category: record.category,
    subcategory: record.subcategory || '',
    destination: record.destination_id || 'bali',
    provider: provider,
    price: {
      amount: Number(record.price_amount),
      currency: record.price_currency || 'USD',
      per: (record.price_per as PricePer) || 'person',
    },
    duration: durationStr,
    durationHours: durationHours,
    startTime: record.start_time ?? undefined,
    groupSize: {
      min: record.group_size_min || 1,
      max: record.group_size_max || 10,
    },
    difficulty: (record.difficulty as Difficulty) || 'Easy',
    languages: record.languages || ['English'],
    images: images,
    description: record.description || '',
    included: included,
    notIncluded: notIncluded,
    meetingPoint: {
      name: record.meeting_point_name || '',
      address: record.meeting_point_address ?? undefined,
      lat: record.meeting_point_lat ?? undefined,
      lng: record.meeting_point_lng ?? undefined,
      instructions: record.meeting_point_instructions || '',
    },
    cancellation:
      record.cancellation_policy || 'Free cancellation up to 24 hours before',
    whatToBring: whatToBring,
    reviews: reviews,
    tags: record.tags || [],
    status: (record.status || 'draft') as ExperienceStatus,
    vendorId: record.vendor_id,
    createdAt: record.created_at,
    updatedAt: record.updated_at ?? undefined,
    publishedAt: record.published_at ?? undefined,
    // instant_book_enabled is on vendors table (migration 21.4)
    instantBookEnabled: record.vendors?.instant_book_enabled ?? false,
    cutoffHours: 2, // Default value
  };
}

// Common select query with all joins
const EXPERIENCE_SELECT = `
    *,
    vendors (
        id,
        business_name,
        photo,
        bio,
        since_year,
        rating,
        review_count,
        response_time,
        verified,
        created_at,
        instant_book_enabled
    ),
    experience_images (
        id,
        image_url,
        display_order
    ),
    experience_inclusions (
        id,
        item_text,
        inclusion_type,
        display_order
    ),
    reviews (
        id,
        author_name,
        country,
        rating,
        text,
        helpful_count,
        created_at
    )
`;

export const dataService = {
  getExperiences: async (): Promise<Experience[]> => {
    if (USE_MOCK_DATA) {
      // Emulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockExperiences;
    }

    const { data, error } = await supabase
      .from('experiences')
      .select(EXPERIENCE_SELECT)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      if (import.meta.env.DEV)
        console.error('Error fetching experiences:', error);
      throw error;
    }

    return (data || []).map(toExperience);
  },

  getExperienceById: async (id: string): Promise<Experience | undefined> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockExperiences.find((e) => e.id === id);
    }

    const { data, error } = await supabase
      .from('experiences')
      .select(EXPERIENCE_SELECT)
      .eq('id', id)
      .single();

    if (error) {
      if (import.meta.env.DEV)
        console.error('Error fetching experience:', error);
      return undefined;
    }

    return toExperience(data);
  },

  getExperiencesByCategory: async (
    categoryId: string,
  ): Promise<Experience[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return mockExperiences.filter((e) => e.category === categoryId);
    }

    const { data, error } = await supabase
      .from('experiences')
      .select(EXPERIENCE_SELECT)
      .eq('category', categoryId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      if (import.meta.env.DEV)
        console.error('Error fetching experiences by category:', error);
      throw error;
    }

    return (data || []).map(toExperience);
  },

  // Search experiences by title/description
  searchExperiences: async (query: string): Promise<Experience[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const lowerQuery = query.toLowerCase();
      return mockExperiences.filter(
        (e) =>
          e.title?.toLowerCase().includes(lowerQuery) ||
          e.description?.toLowerCase().includes(lowerQuery),
      );
    }

    // Sanitize query to prevent SQL injection - escape special characters
    const sanitizedQuery = query.replace(/[%_\\]/g, '\\$&');

    const { data, error } = await supabase
      .from('experiences')
      .select(EXPERIENCE_SELECT)
      .eq('status', 'active')
      .or(
        `title.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%`,
      )
      .order('created_at', { ascending: false });

    if (error) {
      if (import.meta.env.DEV)
        console.error('Error searching experiences:', error);
      throw error;
    }

    return (data || []).map(toExperience);
  },

  // Get experiences by destination
  getExperiencesByDestination: async (
    destinationId: string,
  ): Promise<Experience[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return mockExperiences.filter((e) => e.destination === destinationId);
    }

    const { data, error } = await supabase
      .from('experiences')
      .select(EXPERIENCE_SELECT)
      .eq('destination_id', destinationId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      if (import.meta.env.DEV)
        console.error('Error fetching experiences by destination:', error);
      throw error;
    }

    return (data || []).map(toExperience);
  },
};

// Export the select query for reuse in vendorService
export { EXPERIENCE_SELECT };
