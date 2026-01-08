import { supabase, isSupabaseConfigured } from './supabase'
import { Vendor, Experience, ExperienceStatus, Difficulty, PricePer } from './types'
import { Database } from './database.types'

// Use mock data if Supabase not configured or explicitly enabled
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !isSupabaseConfigured()

type VendorRow = Database['public']['Tables']['vendors']['Row']

export const vendorService = {
    // Get vendor profile by auth User ID
    getVendorByUserId: async (userId: string): Promise<Vendor | null> => {
        if (USE_MOCK_DATA) {
            // Mock implementation - return stored vendor session
            const stored = localStorage.getItem('pulau_vendor_session')
            return stored ? JSON.parse(stored) : null
        }

        const { data, error } = await supabase
            .from('vendors')
            .select('*')
            .eq('owner_id', userId)
            .maybeSingle()

        if (error) {
            console.error('Error fetching vendor:', error)
            return null
        }

        if (!data) return null

        // Map all expanded vendor columns from migration 20260108000005
        return {
            id: data.id,
            businessName: data.business_name,
            businessEmail: data.business_email || '',
            ownerFirstName: data.owner_first_name || '',
            ownerLastName: data.owner_last_name || '',
            phone: data.phone || '',
            sinceYear: data.since_year || new Date(data.created_at).getFullYear(),
            verified: data.verified || false,
            status: data.status,
            createdAt: data.created_at,
            photo: data.photo || undefined,
            bio: data.bio || undefined,
            rating: data.rating || 0,
            reviewCount: data.review_count || 0,
            responseTime: data.response_time || '< 1 hour'
        }
    },

    // Get experiences for a vendor (includes drafts for vendor dashboard)
    getVendorExperiences: async (vendorId: string): Promise<Experience[]> => {
        if (USE_MOCK_DATA) {
            const { experiences } = await import('./mockData')
            return experiences.filter(e => e.provider.id === vendorId || e.vendorId === vendorId)
        }

        // Full join query to get all related data
        const { data, error } = await supabase
            .from('experiences')
            .select(`
                *,
                vendors (
                    id, business_name, photo, bio, since_year,
                    rating, review_count, response_time, verified, created_at
                ),
                experience_images (id, image_url, display_order),
                experience_inclusions (id, item_text, inclusion_type, display_order),
                reviews (id, author_name, country, rating, text, helpful_count, created_at)
            `)
            .eq('vendor_id', vendorId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching vendor experiences:', error)
            return []
        }

        // Map DB records to Experience type using same logic as dataService
        return (data || []).map((record: any) => {
            const vendor = record.vendors
            const provider = {
                id: record.vendor_id || vendorId,
                name: vendor?.business_name || 'Unknown Vendor',
                photo: vendor?.photo || 'https://via.placeholder.com/150',
                bio: vendor?.bio || '',
                since: vendor?.since_year || (vendor?.created_at ? new Date(vendor.created_at).getFullYear() : 2024),
                rating: vendor?.rating || 5.0,
                reviewCount: vendor?.review_count || 0,
                responseTime: vendor?.response_time || 'within 24 hours',
                verified: vendor?.verified || false
            }

            const images = (record.experience_images || [])
                .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                .map((img: any) => img.image_url)

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

            const reviews = (record.reviews || []).map((r: any) => ({
                id: r.id,
                author: r.author_name,
                country: r.country || '',
                date: r.created_at,
                rating: r.rating,
                text: r.text || '',
                helpful: r.helpful_count || 0
            }))

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
                provider,
                price: {
                    amount: Number(record.price_amount),
                    currency: record.price_currency || 'USD',
                    per: (record.price_per as PricePer) || 'person'
                },
                duration: durationStr,
                durationHours,
                startTime: record.start_time,
                groupSize: { min: record.group_size_min || 1, max: record.group_size_max || 10 },
                difficulty: (record.difficulty as Difficulty) || 'Easy',
                languages: record.languages || ['English'],
                images,
                description: record.description || '',
                included,
                notIncluded,
                meetingPoint: {
                    name: record.meeting_point_name || '',
                    address: record.meeting_point_address,
                    lat: record.meeting_point_lat,
                    lng: record.meeting_point_lng,
                    instructions: record.meeting_point_instructions || ''
                },
                cancellation: record.cancellation_policy || 'Free cancellation up to 24 hours before',
                whatToBring,
                reviews,
                tags: record.tags || [],
                status: record.status as ExperienceStatus,
                vendorId: record.vendor_id,
                createdAt: record.created_at,
                updatedAt: record.updated_at,
                publishedAt: record.published_at
            }
        })
    },

    updateExperienceStatus: async (id: string, status: 'active' | 'draft' | 'inactive'): Promise<void> => {
        if (USE_MOCK_DATA) {
            // Mock persistence not fully implemented for separate items, using in-memory/localstorage if full array was stored
            // But here we just return
            return
        }

        const { error } = await supabase.from('experiences').update({ status }).eq('id', id)
        if (error) {
            console.error('Error updating experience status:', error)
            throw error
        }
    }
}
