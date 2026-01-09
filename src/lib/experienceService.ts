import { supabase, isSupabaseConfigured } from './supabase'
import { Experience, ExperienceStatus, Difficulty, PricePer, Provider } from './types'
import { experiences as mockExperiences } from './mockData'

// Use mock data if:
// 1. VITE_USE_MOCK_DATA is explicitly set to 'true', OR
// 2. Supabase is not configured (no valid credentials)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !isSupabaseConfigured()

// Helper to convert DB Record to UI Experience
function toExperience(record: any): Experience {
    // Map vendor data from join
    const vendor = record.vendors
    const provider: Provider = {
        id: record.vendor_id || 'unknown',
        name: vendor?.business_name || 'Unknown Vendor',
        photo: vendor?.photo || 'https://via.placeholder.com/150',
        bio: vendor?.bio || '',
        since: vendor?.since_year || (vendor?.created_at ? new Date(vendor.created_at).getFullYear() : 2024),
        rating: vendor?.rating || 5.0,
        reviewCount: vendor?.review_count || 0,
        responseTime: vendor?.response_time || 'within 24 hours',
        verified: vendor?.verified || false
    }

    // Map images from join (sorted by display_order)
    const images = (record.experience_images || [])
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((img: any) => img.image_url)

    // Map inclusions from join
    const inclusions = record.experience_inclusions || []
    const included = inclusions
        .filter((i: any) => i.inclusion_type === 'included')
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((i: any) => i.item_text)
    const notIncluded = inclusions
        .filter((i: any) => i.inclusion_type === 'not_included')
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((i: any) => i.item_text)
    const whatToBring = inclusions
        .filter((i: any) => i.inclusion_type === 'what_to_bring')
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((i: any) => i.item_text)

    // Map reviews from join
    const reviews = (record.reviews || []).map((r: any) => ({
        id: r.id,
        author: r.author_name,
        country: r.country || '',
        date: r.created_at,
        rating: r.rating,
        text: r.text || '',
        helpful: r.helpful_count || 0
    }))

    // Format duration string
    const durationHours = Number(record.duration_hours) || 2
    const durationStr = durationHours >= 1
        ? `${durationHours} ${durationHours === 1 ? 'hour' : 'hours'}`
        : `${Math.round(durationHours * 60)} minutes`

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
            per: (record.price_per as PricePer) || 'person'
        },
        duration: durationStr,
        durationHours: durationHours,
        startTime: record.start_time,
        groupSize: { min: record.group_size_min || 1, max: record.group_size_max || 10 },
        difficulty: (record.difficulty as Difficulty) || 'Easy',
        languages: record.languages || ['English'],
        images: images,
        description: record.description || '',
        included: included,
        notIncluded: notIncluded,
        meetingPoint: {
            name: record.meeting_point_name || '',
            address: record.meeting_point_address,
            lat: record.meeting_point_lat,
            lng: record.meeting_point_lng,
            instructions: record.meeting_point_instructions || ''
        },
        cancellation: record.cancellation_policy || 'Free cancellation up to 24 hours before',
        whatToBring: whatToBring,
        reviews: reviews,
        tags: record.tags || [],
        status: record.status as ExperienceStatus,
        vendorId: record.vendor_id,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        publishedAt: record.published_at
    }
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
        created_at
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
`

export const experienceService = {
    /**
     * Get all active experiences
     */
    getExperiences: async (): Promise<Experience[]> => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 100))
            return mockExperiences
        }

        const { data, error } = await supabase
            .from('experiences')
            .select(EXPERIENCE_SELECT)
            .eq('status', 'active')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[experienceService] Error fetching experiences:', error)
            throw error
        }

        return (data || []).map(toExperience)
    },

    /**
     * Get a single experience by ID
     */
    getExperienceById: async (id: string): Promise<Experience | undefined> => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 50))
            return mockExperiences.find(e => e.id === id)
        }

        const { data, error } = await supabase
            .from('experiences')
            .select(EXPERIENCE_SELECT)
            .eq('id', id)
            .single()

        if (error) {
            console.error('[experienceService] Error fetching experience:', error)
            return undefined
        }

        return toExperience(data)
    },

    /**
     * Get experiences by category
     */
    getExperiencesByCategory: async (categoryId: string): Promise<Experience[]> => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 50))
            return mockExperiences.filter(e => e.category === categoryId)
        }

        const { data, error } = await supabase
            .from('experiences')
            .select(EXPERIENCE_SELECT)
            .eq('category', categoryId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[experienceService] Error fetching experiences by category:', error)
            throw error
        }

        return (data || []).map(toExperience)
    },

    /**
     * Search experiences by title/description
     */
    searchExperiences: async (query: string): Promise<Experience[]> => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 50))
            const lowerQuery = query.toLowerCase()
            return mockExperiences.filter(e =>
                e.title.toLowerCase().includes(lowerQuery) ||
                e.description.toLowerCase().includes(lowerQuery)
            )
        }

        const { data, error } = await supabase
            .from('experiences')
            .select(EXPERIENCE_SELECT)
            .eq('status', 'active')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[experienceService] Error searching experiences:', error)
            throw error
        }

        return (data || []).map(toExperience)
    },

    /**
     * Get experiences by destination
     */
    getExperiencesByDestination: async (destinationId: string): Promise<Experience[]> => {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 50))
            return mockExperiences.filter(e => e.destination === destinationId)
        }

        const { data, error } = await supabase
            .from('experiences')
            .select(EXPERIENCE_SELECT)
            .eq('destination_id', destinationId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[experienceService] Error fetching experiences by destination:', error)
            throw error
        }

        return (data || []).map(toExperience)
    },

    /**
     * Get multiple experiences by IDs (for resolving trip items)
     */
    getExperiencesByIds: async (ids: string[]): Promise<Experience[]> => {
        if (ids.length === 0) return []

        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 50))
            return mockExperiences.filter(e => ids.includes(e.id))
        }

        const { data, error } = await supabase
            .from('experiences')
            .select(EXPERIENCE_SELECT)
            .in('id', ids)

        if (error) {
            console.error('[experienceService] Error fetching experiences by ids:', error)
            throw error
        }

        return (data || []).map(toExperience)
    }
}
