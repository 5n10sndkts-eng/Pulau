/**
 * Preference Service
 * Epic 4: Onboarding & Personalization
 *
 * Handles user preferences from onboarding flow
 */

import { supabase } from './supabase';
import { Database } from './database.types';

type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
type UserPreferencesInsert =
  Database['public']['Tables']['user_preferences']['Insert'];
type UserPreferencesUpdate =
  Database['public']['Tables']['user_preferences']['Update'];

export interface PreferenceData {
  travelStyle: string[];
  groupType: string;
  budgetLevel: string;
  tripStartDate?: string;
  tripEndDate?: string;
}

class PreferenceService {
  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // No preferences found is expected for new users
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw new Error('Failed to fetch user preferences');
    }
  }

  /**
   * Upsert user preferences (create or update)
   */
  async upsertPreferences(
    userId: string,
    preferences: PreferenceData,
  ): Promise<UserPreferences> {
    try {
      const preferenceData: UserPreferencesInsert = {
        user_id: userId,
        travel_style: preferences.travelStyle,
        group_type: preferences.groupType,
        budget_level: preferences.budgetLevel,
        trip_start_date: preferences.tripStartDate || null,
        trip_end_date: preferences.tripEndDate || null,
      };

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(preferenceData, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error upserting user preferences:', error);
      throw new Error('Failed to save user preferences');
    }
  }

  /**
   * Update trip dates only
   */
  async updateTripDates(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<UserPreferences> {
    try {
      const updateData: UserPreferencesUpdate = {
        trip_start_date: startDate || null,
        trip_end_date: endDate || null,
      };

      const { data, error } = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating trip dates:', error);
      throw new Error('Failed to update trip dates');
    }
  }

  /**
   * Mark onboarding as completed in user profile
   */
  async markOnboardingComplete(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      throw new Error('Failed to complete onboarding');
    }
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data?.onboarding_completed ?? false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Clear user preferences (for testing or reset)
   */
  async clearPreferences(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing preferences:', error);
      throw new Error('Failed to clear preferences');
    }
  }
}

export const preferenceService = new PreferenceService();
