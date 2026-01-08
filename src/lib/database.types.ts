export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      destinations: {
        Row: {
          id: string
          name: string
          country: string
          tagline: string | null
          hero_image: string | null
          currency: string
          timezone: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          country: string
          tagline?: string | null
          hero_image?: string | null
          currency?: string
          timezone?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          tagline?: string | null
          hero_image?: string | null
          currency?: string
          timezone?: string | null
          active?: boolean
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          created_at: string
          preferences: Json | null
          saved: string[] | null
          currency: string | null
          language: string | null
          has_completed_onboarding: boolean
          email_verified: boolean
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          preferences?: Json | null
          saved?: string[] | null
          currency?: string | null
          language?: string | null
          has_completed_onboarding?: boolean
          email_verified?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          created_at?: string
          preferences?: Json | null
          saved?: string[] | null
          currency?: string | null
          language?: string | null
          has_completed_onboarding?: boolean
          email_verified?: boolean
        }
      }
      vendors: {
        Row: {
          id: string
          owner_id: string
          business_name: string
          business_email: string | null
          owner_first_name: string | null
          owner_last_name: string | null
          phone: string | null
          since_year: number
          photo: string | null
          bio: string | null
          response_time: string
          rating: number
          review_count: number
          status: 'pending_verification' | 'active' | 'suspended'
          verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          business_name: string
          business_email?: string | null
          owner_first_name?: string | null
          owner_last_name?: string | null
          phone?: string | null
          since_year?: number
          photo?: string | null
          bio?: string | null
          response_time?: string
          rating?: number
          review_count?: number
          status?: 'pending_verification' | 'active' | 'suspended'
          verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          business_name?: string
          business_email?: string | null
          owner_first_name?: string | null
          owner_last_name?: string | null
          phone?: string | null
          since_year?: number
          photo?: string | null
          bio?: string | null
          response_time?: string
          rating?: number
          review_count?: number
          status?: 'pending_verification' | 'active' | 'suspended'
          verified?: boolean
          created_at?: string
        }
      }
      experiences: {
        Row: {
          id: string
          vendor_id: string
          destination_id: string
          title: string
          description: string | null
          category: string
          subcategory: string | null
          price_amount: number
          price_currency: string
          price_per: 'person' | 'vehicle' | 'group'
          duration_hours: number | null
          start_time: string | null
          group_size_min: number
          group_size_max: number
          difficulty: 'Easy' | 'Moderate' | 'Challenging'
          languages: string[]
          meeting_point_name: string | null
          meeting_point_address: string | null
          meeting_point_lat: number | null
          meeting_point_lng: number | null
          meeting_point_instructions: string | null
          cancellation_policy: string | null
          tags: string[]
          status: 'draft' | 'active' | 'inactive' | 'sold_out'
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          vendor_id: string
          destination_id?: string
          title: string
          description?: string | null
          category: string
          subcategory?: string | null
          price_amount: number
          price_currency?: string
          price_per?: 'person' | 'vehicle' | 'group'
          duration_hours?: number | null
          start_time?: string | null
          group_size_min?: number
          group_size_max?: number
          difficulty?: 'Easy' | 'Moderate' | 'Challenging'
          languages?: string[]
          meeting_point_name?: string | null
          meeting_point_address?: string | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          meeting_point_instructions?: string | null
          cancellation_policy?: string | null
          tags?: string[]
          status?: 'draft' | 'active' | 'inactive' | 'sold_out'
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          vendor_id?: string
          destination_id?: string
          title?: string
          description?: string | null
          category?: string
          subcategory?: string | null
          price_amount?: number
          price_currency?: string
          price_per?: 'person' | 'vehicle' | 'group'
          duration_hours?: number | null
          start_time?: string | null
          group_size_min?: number
          group_size_max?: number
          difficulty?: 'Easy' | 'Moderate' | 'Challenging'
          languages?: string[]
          meeting_point_name?: string | null
          meeting_point_address?: string | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          meeting_point_instructions?: string | null
          cancellation_policy?: string | null
          tags?: string[]
          status?: 'draft' | 'active' | 'inactive' | 'sold_out'
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      experience_images: {
        Row: {
          id: string
          experience_id: string
          image_url: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          experience_id: string
          image_url: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          experience_id?: string
          image_url?: string
          display_order?: number
          created_at?: string
        }
      }
      experience_inclusions: {
        Row: {
          id: string
          experience_id: string
          item_text: string
          inclusion_type: 'included' | 'not_included' | 'what_to_bring'
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          experience_id: string
          item_text: string
          inclusion_type: 'included' | 'not_included' | 'what_to_bring'
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          experience_id?: string
          item_text?: string
          inclusion_type?: 'included' | 'not_included' | 'what_to_bring'
          display_order?: number
          created_at?: string
        }
      }
      experience_availability: {
        Row: {
          id: string
          experience_id: string
          date: string
          slots_available: number
          slots_total: number
          status: 'available' | 'blocked' | 'sold_out'
          created_at: string
        }
        Insert: {
          id?: string
          experience_id: string
          date: string
          slots_available: number
          slots_total?: number
          status?: 'available' | 'blocked' | 'sold_out'
          created_at?: string
        }
        Update: {
          id?: string
          experience_id?: string
          date?: string
          slots_available?: number
          slots_total?: number
          status?: 'available' | 'blocked' | 'sold_out'
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          experience_id: string
          user_id: string
          author_name: string
          country: string | null
          rating: number
          text: string | null
          helpful_count: number
          verified_booking: boolean
          created_at: string
        }
        Insert: {
          id?: string
          experience_id: string
          user_id: string
          author_name: string
          country?: string | null
          rating: number
          text?: string | null
          helpful_count?: number
          verified_booking?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          experience_id?: string
          user_id?: string
          author_name?: string
          country?: string | null
          rating?: number
          text?: string | null
          helpful_count?: number
          verified_booking?: boolean
          created_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          destination_id: string
          name: string | null
          status: 'planning' | 'booked' | 'active' | 'completed' | 'cancelled'
          start_date: string | null
          end_date: string | null
          travelers: number
          subtotal: number
          service_fee: number
          total: number
          booking_reference: string | null
          booked_at: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
          share_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          destination_id: string
          name?: string | null
          status?: 'planning' | 'booked' | 'active' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          travelers?: number
          subtotal?: number
          service_fee?: number
          total?: number
          booking_reference?: string | null
          booked_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          share_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          destination_id?: string
          name?: string | null
          status?: 'planning' | 'booked' | 'active' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          travelers?: number
          subtotal?: number
          service_fee?: number
          total?: number
          booking_reference?: string | null
          booked_at?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          share_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trip_items: {
        Row: {
          id: string
          trip_id: string
          experience_id: string
          guests: number
          total_price: number
          date: string | null
          time: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          experience_id: string
          guests: number
          total_price: number
          date?: string | null
          time?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          experience_id?: string
          guests?: number
          total_price?: number
          date?: string | null
          time?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          trip_id: string
          reference: string
          status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
          booked_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          reference: string
          status?: 'confirmed' | 'pending' | 'cancelled' | 'completed'
          booked_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          reference?: string
          status?: 'confirmed' | 'pending' | 'cancelled' | 'completed'
          booked_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          payment_token: string
          last_four: string
          card_brand: 'visa' | 'mastercard' | 'amex' | 'discover'
          expiry_month: number
          expiry_year: number
          is_default: boolean
          cardholder_name: string
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          payment_token: string
          last_four: string
          card_brand: 'visa' | 'mastercard' | 'amex' | 'discover'
          expiry_month: number
          expiry_year: number
          is_default?: boolean
          cardholder_name: string
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          payment_token?: string
          last_four?: string
          card_brand?: 'visa' | 'mastercard' | 'amex' | 'discover'
          expiry_month?: number
          expiry_year?: number
          is_default?: boolean
          cardholder_name?: string
          created_at?: string
          deleted_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common table operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
