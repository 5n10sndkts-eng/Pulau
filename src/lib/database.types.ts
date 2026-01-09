export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          actor_id: string | null
          actor_type: string
          created_at: string
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          metadata: Json
          stripe_event_id: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_type: string
          created_at?: string
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json
          stripe_event_id?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json
          stripe_event_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booked_at: string
          id: string
          reference: string
          status: string | null
          trip_id: string
        }
        Insert: {
          booked_at?: string
          id?: string
          reference: string
          status?: string | null
          trip_id: string
        }
        Update: {
          booked_at?: string
          id?: string
          reference?: string
          status?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          active: boolean | null
          country: string
          created_at: string
          currency: string | null
          hero_image: string | null
          id: string
          name: string
          tagline: string | null
          timezone: string | null
        }
        Insert: {
          active?: boolean | null
          country: string
          created_at?: string
          currency?: string | null
          hero_image?: string | null
          id: string
          name: string
          tagline?: string | null
          timezone?: string | null
        }
        Update: {
          active?: boolean | null
          country?: string
          created_at?: string
          currency?: string | null
          hero_image?: string | null
          id?: string
          name?: string
          tagline?: string | null
          timezone?: string | null
        }
        Relationships: []
      }
      experience_availability: {
        Row: {
          created_at: string
          date: string
          experience_id: string
          id: string
          slots_available: number
          slots_total: number
          status: string | null
        }
        Insert: {
          created_at?: string
          date: string
          experience_id: string
          id?: string
          slots_available?: number
          slots_total?: number
          status?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          experience_id?: string
          id?: string
          slots_available?: number
          slots_total?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_availability_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_images: {
        Row: {
          created_at: string
          display_order: number | null
          experience_id: string
          id: string
          image_url: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          experience_id: string
          id?: string
          image_url: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          experience_id?: string
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_images_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_inclusions: {
        Row: {
          created_at: string
          display_order: number | null
          experience_id: string
          id: string
          inclusion_type: string
          item_text: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          experience_id: string
          id?: string
          inclusion_type: string
          item_text: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          experience_id?: string
          id?: string
          inclusion_type?: string
          item_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_inclusions_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_slots: {
        Row: {
          available_count: number
          created_at: string | null
          experience_id: string
          id: string
          is_blocked: boolean | null
          price_override_amount: number | null
          slot_date: string
          slot_time: string
          total_capacity: number
          updated_at: string | null
        }
        Insert: {
          available_count: number
          created_at?: string | null
          experience_id: string
          id?: string
          is_blocked?: boolean | null
          price_override_amount?: number | null
          slot_date: string
          slot_time: string
          total_capacity: number
          updated_at?: string | null
        }
        Update: {
          available_count?: number
          created_at?: string | null
          experience_id?: string
          id?: string
          is_blocked?: boolean | null
          price_override_amount?: number | null
          slot_date?: string
          slot_time?: string
          total_capacity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_slots_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          cancellation_policy: string | null
          category: string
          created_at: string
          description: string | null
          destination_id: string | null
          difficulty: string | null
          duration_hours: number | null
          group_size_max: number | null
          group_size_min: number | null
          id: string
          instant_book_enabled: boolean | null
          languages: string[] | null
          meeting_point_address: string | null
          meeting_point_instructions: string | null
          meeting_point_lat: number | null
          meeting_point_lng: number | null
          meeting_point_name: string | null
          price_amount: number
          price_currency: string | null
          price_per: string | null
          published_at: string | null
          start_time: string | null
          status: string | null
          subcategory: string | null
          tags: string[] | null
          title: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          cancellation_policy?: string | null
          category: string
          created_at?: string
          description?: string | null
          destination_id?: string | null
          difficulty?: string | null
          duration_hours?: number | null
          group_size_max?: number | null
          group_size_min?: number | null
          id?: string
          instant_book_enabled?: boolean | null
          languages?: string[] | null
          meeting_point_address?: string | null
          meeting_point_instructions?: string | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          meeting_point_name?: string | null
          price_amount: number
          price_currency?: string | null
          price_per?: string | null
          published_at?: string | null
          start_time?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          cancellation_policy?: string | null
          category?: string
          created_at?: string
          description?: string | null
          destination_id?: string | null
          difficulty?: string | null
          duration_hours?: number | null
          group_size_max?: number | null
          group_size_min?: number | null
          id?: string
          instant_book_enabled?: boolean | null
          languages?: string[] | null
          meeting_point_address?: string | null
          meeting_point_instructions?: string | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          meeting_point_name?: string | null
          price_amount?: number
          price_currency?: string | null
          price_per?: string | null
          published_at?: string | null
          start_time?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiences_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          card_brand: string
          cardholder_name: string
          created_at: string
          deleted_at: string | null
          expiry_month: number
          expiry_year: number
          id: string
          is_default: boolean | null
          last_four: string
          payment_token: string
          user_id: string
        }
        Insert: {
          card_brand: string
          cardholder_name: string
          created_at?: string
          deleted_at?: string | null
          expiry_month: number
          expiry_year: number
          id?: string
          is_default?: boolean | null
          last_four: string
          payment_token: string
          user_id: string
        }
        Update: {
          card_brand?: string
          cardholder_name?: string
          created_at?: string
          deleted_at?: string | null
          expiry_month?: number
          expiry_year?: number
          id?: string
          is_default?: boolean | null
          last_four?: string
          payment_token?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          currency: string
          id: string
          platform_fee: number
          refund_amount: number | null
          refund_reason: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string
          updated_at: string | null
          vendor_payout: number
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          currency?: string
          id?: string
          platform_fee: number
          refund_amount?: number | null
          refund_reason?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id: string
          updated_at?: string | null
          vendor_payout: number
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          currency?: string
          id?: string
          platform_fee?: number
          refund_amount?: number | null
          refund_reason?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string
          updated_at?: string | null
          vendor_payout?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          currency: string | null
          email: string
          email_verified: boolean | null
          first_name: string | null
          full_name: string | null
          has_completed_onboarding: boolean | null
          id: string
          language: string | null
          last_name: string | null
          preferences: Json | null
          saved: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          currency?: string | null
          email: string
          email_verified?: boolean | null
          first_name?: string | null
          full_name?: string | null
          has_completed_onboarding?: boolean | null
          id: string
          language?: string | null
          last_name?: string | null
          preferences?: Json | null
          saved?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          currency?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string | null
          full_name?: string | null
          has_completed_onboarding?: boolean | null
          id?: string
          language?: string | null
          last_name?: string | null
          preferences?: Json | null
          saved?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          country: string | null
          created_at: string
          experience_id: string
          helpful_count: number | null
          id: string
          rating: number
          text: string | null
          user_id: string
          verified_booking: boolean | null
        }
        Insert: {
          author_name: string
          country?: string | null
          created_at?: string
          experience_id: string
          helpful_count?: number | null
          id?: string
          rating: number
          text?: string | null
          user_id: string
          verified_booking?: boolean | null
        }
        Update: {
          author_name?: string
          country?: string | null
          created_at?: string
          experience_id?: string
          helpful_count?: number | null
          id?: string
          rating?: number
          text?: string | null
          user_id?: string
          verified_booking?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_items: {
        Row: {
          created_at: string
          date: string | null
          experience_id: string
          guests: number | null
          id: string
          notes: string | null
          time: string | null
          total_price: number
          trip_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          experience_id: string
          guests?: number | null
          id?: string
          notes?: string | null
          time?: string | null
          total_price: number
          trip_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          experience_id?: string
          guests?: number | null
          id?: string
          notes?: string | null
          time?: string | null
          total_price?: number
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          booked_at: string | null
          booking_reference: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          destination_id: string
          end_date: string | null
          id: string
          name: string | null
          service_fee: number | null
          share_token: string | null
          start_date: string | null
          status: string | null
          subtotal: number | null
          total: number | null
          travelers: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          booked_at?: string | null
          booking_reference?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          destination_id: string
          end_date?: string | null
          id?: string
          name?: string | null
          service_fee?: number | null
          share_token?: string | null
          start_date?: string | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
          travelers?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          booked_at?: string | null
          booking_reference?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          destination_id?: string
          end_date?: string | null
          id?: string
          name?: string | null
          service_fee?: number | null
          share_token?: string | null
          start_date?: string | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
          travelers?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          bio: string | null
          business_email: string | null
          business_name: string
          created_at: string
          id: string
          instant_book_enabled: boolean | null
          last_activity_at: string | null
          onboarding_state: Database["public"]["Enums"]["vendor_onboarding_state"] | null
          owner_first_name: string | null
          owner_id: string
          owner_last_name: string | null
          phone: string | null
          photo: string | null
          rating: number | null
          response_time: string | null
          review_count: number | null
          since_year: number | null
          status: string | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean | null
          verified: boolean | null
        }
        Insert: {
          bio?: string | null
          business_email?: string | null
          business_name: string
          created_at?: string
          id?: string
          instant_book_enabled?: boolean | null
          last_activity_at?: string | null
          onboarding_state?: Database["public"]["Enums"]["vendor_onboarding_state"] | null
          owner_first_name?: string | null
          owner_id: string
          owner_last_name?: string | null
          phone?: string | null
          photo?: string | null
          rating?: number | null
          response_time?: string | null
          review_count?: number | null
          since_year?: number | null
          status?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          verified?: boolean | null
        }
        Update: {
          bio?: string | null
          business_email?: string | null
          business_name?: string
          created_at?: string
          id?: string
          instant_book_enabled?: boolean | null
          last_activity_at?: string | null
          onboarding_state?: Database["public"]["Enums"]["vendor_onboarding_state"] | null
          owner_first_name?: string | null
          owner_id?: string
          owner_last_name?: string | null
          phone?: string | null
          photo?: string | null
          rating?: number | null
          response_time?: string | null
          review_count?: number | null
          since_year?: number | null
          status?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      vendor_onboarding_state: 'registered' | 'kyc_submitted' | 'kyc_verified' | 'kyc_rejected' | 'bank_linked' | 'active' | 'suspended'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
