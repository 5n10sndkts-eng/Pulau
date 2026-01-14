/**
 * Onboarding Constants
 * Story: 33.2 - Single-Screen Onboarding Redesign
 *
 * Shared constants for onboarding preferences and defaults.
 * Single source of truth for travel styles, group types, and budget levels.
 */

import {
  Mountain,
  Heart,
  Sparkles,
  Palmtree,
  User,
  Users,
  UsersRound,
  Baby,
  Wallet,
  TrendingUp,
  Gem,
} from 'lucide-react';

export const ONBOARDING_DEFAULTS = {
  travelStyles: ['adventure'] as const,
  groupType: 'solo' as const,
  budget: 'midrange' as const,
} as const;

export type TravelStyle = 'adventure' | 'relaxation' | 'culture' | 'wellness';
export type GroupType = 'solo' | 'couple' | 'friends' | 'family';
export type BudgetLevel = 'budget' | 'midrange' | 'luxury';

export const TRAVEL_STYLES = [
  { id: 'adventure', label: 'Adventure', icon: Mountain, color: 'text-primary' },
  { id: 'relaxation', label: 'Relaxation', icon: Heart, color: 'text-accent' },
  { id: 'culture', label: 'Culture', icon: Sparkles, color: 'text-golden' },
  { id: 'wellness', label: 'Wellness', icon: Palmtree, color: 'text-success' },
] as const;

export const GROUP_TYPES = [
  { id: 'solo', label: 'Solo', icon: User },
  { id: 'couple', label: 'Couple', icon: Users },
  { id: 'friends', label: 'Friends', icon: UsersRound },
  { id: 'family', label: 'Family', icon: Baby },
] as const;

export const BUDGET_LEVELS = [
  { id: 'budget', label: 'Budget', icon: Wallet, color: 'text-success' },
  { id: 'midrange', label: 'Mid-Range', icon: TrendingUp, color: 'text-accent' },
  { id: 'luxury', label: 'Luxury', icon: Gem, color: 'text-golden' },
] as const;
