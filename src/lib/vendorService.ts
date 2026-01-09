import { supabase, isSupabaseConfigured } from './supabase'
import { Vendor, Experience } from './types'
import { toExperience, EXPERIENCE_SELECT } from './dataService'

// Use mock data if Supabase not configured or explicitly enabled
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !isSupabaseConfigured()

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
            if (import.meta.env.DEV) console.error('Error fetching vendor:', error)
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
            status: (data.status as 'pending_verification' | 'active' | 'suspended') || 'pending_verification',
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

        // Use shared EXPERIENCE_SELECT and toExperience from dataService
        const { data, error } = await supabase
            .from('experiences')
            .select(EXPERIENCE_SELECT)
            .eq('vendor_id', vendorId)
            .order('created_at', { ascending: false })

        if (error) {
            if (import.meta.env.DEV) console.error('Error fetching vendor experiences:', error)
            return []
        }

        // Use shared toExperience mapper to avoid code duplication
        return (data || []).map(toExperience)
    },

    updateExperienceStatus: async (id: string, status: 'active' | 'draft' | 'inactive'): Promise<void> => {
        if (USE_MOCK_DATA) {
            // Mock persistence not fully implemented for separate items
            return
        }

        const { error } = await supabase.from('experiences').update({ status }).eq('id', id)
        if (error) {
            if (import.meta.env.DEV) console.error('Error updating experience status:', error)
            throw error
        }
    }
}
