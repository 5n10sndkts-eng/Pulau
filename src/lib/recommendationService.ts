/**
 * Recommendation Service
 * Epic 4: Onboarding & Personalization
 * Story 4.4: Personalized Recommendations Engine
 *
 * Scores experiences based on user preferences and logs for ML improvements
 */

import { supabase } from './supabase';
import { Database } from './database.types';
import { preferenceService } from './preferenceService';

type Experience = Database['public']['Tables']['experiences']['Row'];
type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
type RecommendationLog =
  Database['public']['Tables']['recommendations_log']['Insert'];

export interface ScoredExperience {
  experience: Experience;
  score: number;
  breakdown: {
    difficulty: number;
    tags: number;
    price: number;
    groupSize: number;
  };
  isPerfectForYou: boolean;
}

/**
 * Scoring algorithm per Story 4.4 acceptance criteria:
 * - +10 points if difficulty matches travel_style
 * - +15 points if tags overlap with travel_style
 * - +5 points if price fits budget_level
 * - +5 points if group_size >= typical group size
 */
class RecommendationService {
  /**
   * Score a single experience based on user preferences
   */
  private scoreExperience(
    experience: Experience,
    preferences: UserPreferences,
  ): ScoredExperience['breakdown'] {
    const breakdown = {
      difficulty: 0,
      tags: 0,
      price: 0,
      groupSize: 0,
    };

    // Score difficulty match with travel style
    if (preferences.travel_style && experience.difficulty) {
      const styles = preferences.travel_style;
      const difficulty = experience.difficulty;

      if (styles.includes('Adventure')) {
        if (difficulty === 'Moderate' || difficulty === 'Challenging') {
          breakdown.difficulty = 10;
        }
      }
      if (styles.includes('Relaxation')) {
        if (difficulty === 'Easy') {
          breakdown.difficulty = 10;
        }
      }
      if (styles.includes('Culture')) {
        if (difficulty === 'Easy' || difficulty === 'Moderate') {
          breakdown.difficulty = 10;
        }
      }
      if (styles.includes('Mix of Everything')) {
        breakdown.difficulty = 5; // Neutral bonus for flexibility
      }
    }

    // Score tag overlap with travel style
    if (preferences.travel_style && experience.tags) {
      const styleTags = preferences.travel_style.map((s) => s.toLowerCase());
      const experienceTags = (experience.tags as string[]).map((t) =>
        t.toLowerCase(),
      );

      const hasOverlap = styleTags.some((styleTag) =>
        experienceTags.some(
          (expTag) => expTag.includes(styleTag) || styleTag.includes(expTag),
        ),
      );

      if (hasOverlap) {
        breakdown.tags = 15;
      }
    }

    // Score price fit with budget level
    if (preferences.budget_level && experience.price_amount != null) {
      const price = Number(experience.price_amount);
      const budget = preferences.budget_level;

      if (budget === 'Budget-Conscious' && price < 50) {
        breakdown.price = 5;
      } else if (budget === 'Mid-Range' && price >= 50 && price <= 150) {
        breakdown.price = 5;
      } else if (budget === 'Luxury' && price > 150) {
        breakdown.price = 5;
      }
    }

    // Score group size compatibility
    if (preferences.group_type && experience.group_size_max != null) {
      const maxSize = experience.group_size_max;
      const groupType = preferences.group_type;

      const typicalSizes: Record<string, number> = {
        Solo: 1,
        Couple: 2,
        Friends: 4,
        Family: 5,
      };

      const requiredSize = typicalSizes[groupType] || 1;
      if (maxSize >= requiredSize) {
        breakdown.groupSize = 5;
      }
    }

    return breakdown;
  }

  /**
   * Get recommended experiences for a user
   */
  async getRecommendations(
    userId: string,
    experiences: Experience[],
    limit = 3,
  ): Promise<ScoredExperience[]> {
    try {
      // Get user preferences
      const preferences = await preferenceService.getPreferences(userId);

      // If no preferences, return empty (user hasn't completed onboarding)
      if (!preferences) {
        return [];
      }

      // Score all experiences
      const scoredExperiences: ScoredExperience[] = experiences.map((exp) => {
        const breakdown = this.scoreExperience(exp, preferences);
        const score =
          breakdown.difficulty +
          breakdown.tags +
          breakdown.price +
          breakdown.groupSize;

        return {
          experience: exp,
          score,
          breakdown,
          isPerfectForYou: false, // Will be set for top N
        };
      });

      // Sort by score descending
      scoredExperiences.sort((a, b) => b.score - a.score);

      // Mark top N as "Perfect for you"
      const topRecommendations = scoredExperiences.slice(0, limit);
      topRecommendations.forEach((rec) => {
        rec.isPerfectForYou = true;
      });

      // Log recommendations for ML
      await this.logRecommendations(userId, scoredExperiences, preferences);

      return scoredExperiences;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw new Error('Failed to get recommendations');
    }
  }

  /**
   * Log recommendation scores to recommendations_log table
   */
  private async logRecommendations(
    userId: string,
    scoredExperiences: ScoredExperience[],
    preferences: UserPreferences,
  ): Promise<void> {
    try {
      const logs: RecommendationLog[] = scoredExperiences.map((scored) => ({
        user_id: userId,
        experience_id: scored.experience.id,
        score_total: scored.score,
        score_difficulty: scored.breakdown.difficulty,
        score_tags: scored.breakdown.tags,
        score_price: scored.breakdown.price,
        score_group_size: scored.breakdown.groupSize,
        user_travel_style: preferences.travel_style,
        user_group_type: preferences.group_type,
        user_budget_level: preferences.budget_level,
        experience_difficulty: scored.experience.difficulty,
        experience_tags: scored.experience.tags as string[],
        experience_price: scored.experience.price_amount,
        recommended: scored.isPerfectForYou,
        clicked: false,
        booked: false,
      }));

      // Batch insert logs (Supabase handles this efficiently)
      const { error } = await supabase.from('recommendations_log').insert(logs);

      if (error) {
        console.error('Error logging recommendations:', error);
        // Don't throw - logging failures shouldn't block recommendations
      }
    } catch (error) {
      console.error('Failed to log recommendations:', error);
      // Swallow error - logging is nice-to-have, not critical
    }
  }

  /**
   * Track when user clicks a recommendation
   */
  async trackClick(userId: string, experienceId: string): Promise<void> {
    try {
      // Update most recent log entry for this user-experience pair
      const { error } = await supabase
        .from('recommendations_log')
        .update({ clicked: true })
        .eq('user_id', userId)
        .eq('experience_id', experienceId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error tracking click:', error);
      }
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  }

  /**
   * Track when user books a recommendation
   */
  async trackBooking(userId: string, experienceId: string): Promise<void> {
    try {
      // Update most recent log entry for this user-experience pair
      const { error } = await supabase
        .from('recommendations_log')
        .update({ booked: true })
        .eq('user_id', userId)
        .eq('experience_id', experienceId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error tracking booking:', error);
      }
    } catch (error) {
      console.error('Failed to track booking:', error);
    }
  }
}

export const recommendationService = new RecommendationService();
