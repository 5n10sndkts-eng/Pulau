import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Experience, FilterType, UserPreferences } from '@/lib/types';
import {
  getExperiencesByCategory,
  filterExperiences,
  formatPrice,
  getRecommendedExperiences,
} from '@/lib/helpers';
import { categories } from '@/lib/mockData';
import {
  ArrowLeft,
  Search,
  Clock,
  Users,
  Star,
  Heart,
  Plus,
  Check,
  Zap,
  Wallet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PerfectForYouBadge } from '@/components/ui/PerfectForYouBadge';
import { useFlyingIcon } from '@/components/FlyingIcon';
import { useTrip } from '@/contexts/TripContext';
import { getRemainingBudget, BUDGET_CAPS } from '@/lib/budgetHelpers';

interface CategoryBrowserProps {
  categoryId: string;
  userPreferences?: UserPreferences;
  savedExperiences: string[];
  onBack: () => void;
  onExperienceSelect: (experienceId: string) => void;
  onQuickAdd: (experience: Experience) => void;
  onToggleSave: (experienceId: string) => void;
}

const baseFilters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'underbudget', label: 'Under Budget' }, // Smart filter (AC #2)
  { id: 'beginner', label: 'Beginner Friendly' },
  { id: 'halfday', label: 'Half Day' },
  { id: 'fullday', label: 'Full Day' },
  { id: 'private', label: 'Private' },
  { id: 'group', label: 'Group' },
  { id: 'under50', label: 'Under $50' },
  { id: 'toprated', label: 'Top Rated' },
  { id: 'instant', label: 'Instant Confirmation' },
];

export function CategoryBrowser({
  categoryId,
  userPreferences,
  savedExperiences,
  onBack,
  onExperienceSelect,
  onQuickAdd,
  onToggleSave,
}: CategoryBrowserProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { trip, removeFromTrip } = useTrip();
  const { triggerFly, FlyingIcons } = useFlyingIcon();

  const category = categories.find((c) => c.id === categoryId);
  const allExperiences = getExperiencesByCategory(categoryId);

  // Calculate remaining budget for "Under Budget" filter (AC #2)
  const budgetPref = userPreferences?.budget;
  const remainingBudget = budgetPref
    ? getRemainingBudget(budgetPref, trip.total)
    : null;

  // Filter experiences - handle "underbudget" specially
  const filteredExps =
    activeFilter === 'underbudget' && remainingBudget !== null
      ? allExperiences.filter((exp) => exp.price.amount <= remainingBudget)
      : filterExperiences(allExperiences, activeFilter);

  // Only show "Under Budget" filter if user has budget preference set
  const filters = budgetPref
    ? baseFilters
    : baseFilters.filter((f) => f.id !== 'underbudget');

  const recommendedExps = userPreferences
    ? getRecommendedExperiences(
        categoryId,
        userPreferences.travelStyles,
        userPreferences.groupType,
      )
    : [];

  // Top 3 IDs are "recommended"
  const recommendedIds = recommendedExps.slice(0, 3).map((e) => e.id);

  // Get IDs of items in trip for toggle state
  const tripItemIds = trip.items.map((i) => i.experienceId);

  const handleQuickAddWithAnimation = (
    exp: Experience,
    buttonRect: DOMRect,
  ) => {
    const isInTrip = tripItemIds.includes(exp.id);

    if (isInTrip) {
      // Remove from trip
      removeFromTrip(exp.id);
    } else {
      // Add to trip with animation
      triggerFly(
        buttonRect.x + buttonRect.width / 2,
        buttonRect.y + buttonRect.height / 2,
      );
      onQuickAdd(exp);
    }
  };

  return (
    <>
      <FlyingIcons />
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-10 bg-card border-b">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display text-xl font-bold flex-1 text-center">
              {categories.find((c) => c.id === categoryId)?.name || 'Category'}
            </h1>
            <Button variant="ghost" size="icon" aria-label="Filter options">
              <Search className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="w-full">
            <div className="flex gap-2 px-4 pb-4">
              {filters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant={activeFilter === filter.id ? 'default' : 'outline'}
                  className={`cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    filter.id === 'underbudget' &&
                    activeFilter !== 'underbudget'
                      ? 'border-success/50 text-success hover:bg-success/10'
                      : ''
                  }`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.id === 'instant' && <Zap className="w-3 h-3" />}
                  {filter.id === 'underbudget' && (
                    <Wallet className="w-3 h-3" />
                  )}
                  {filter.id === 'underbudget' && remainingBudget !== null
                    ? `Under $${Math.floor(remainingBudget)}`
                    : filter.label}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="p-4 space-y-6">
          {/* Recommended section removed in favor of badges on list items */}

          {filteredExps.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-display text-xl font-semibold">
                No experiences match these filters
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or explore all options
              </p>
              <Button onClick={() => setActiveFilter('all')} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredExps.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  experience={exp}
                  isSaved={savedExperiences.includes(exp.id)}
                  isInTrip={tripItemIds.includes(exp.id)}
                  isRecommended={recommendedIds.includes(exp.id)}
                  onSelect={() => onExperienceSelect(exp.id)}
                  onQuickAdd={(buttonRect) =>
                    handleQuickAddWithAnimation(exp, buttonRect)
                  }
                  onToggleSave={() => onToggleSave(exp.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ExperienceCard({
  experience,
  isSaved,
  isInTrip,
  isRecommended,
  onSelect,
  onQuickAdd,
  onToggleSave,
}: {
  experience: Experience;
  isSaved: boolean;
  isInTrip: boolean;
  isRecommended?: boolean;
  onSelect: () => void;
  onQuickAdd: (buttonRect: DOMRect) => void;
  onToggleSave: () => void;
}) {
  const addButtonRef = useRef<HTMLButtonElement>(null);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
        <div className="relative" onClick={onSelect}>
          <div className="overflow-hidden">
            <motion.img
              src={experience.images[0]}
              alt={experience.title}
              className="w-full aspect-video object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isRecommended && <PerfectForYouBadge />}
            {experience.provider.instantBookEnabled && (
              <Badge
                variant="secondary"
                className="bg-[oklch(0.87_0.12_85)] text-[oklch(0.25_0_0)] backdrop-blur-sm shadow-sm self-start flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" strokeWidth={2} />
                Instant
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="bg-white/95 backdrop-blur-sm shadow-sm self-start"
            >
              {experience.provider.name}
            </Badge>
          </div>
          <motion.button
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              animate={isSaved ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${isSaved ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
              />
            </motion.div>
          </motion.button>
        </div>

        <div className="p-5 space-y-3">
          <h3
            className="font-display text-lg font-semibold leading-tight cursor-pointer group-hover:text-primary transition-colors"
            onClick={onSelect}
          >
            {experience.title}
          </h3>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{experience.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>
                Max {experience.groupSize.max}{' '}
                {experience.groupSize.max === 1 ? 'person' : 'people'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-golden text-golden" />
              <span className="font-medium text-foreground">
                {experience.provider.rating}
              </span>
              <span className="text-muted-foreground">
                ({experience.provider.reviewCount})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                From
              </p>
              <p className="font-display text-2xl font-bold">
                {formatPrice(experience.price.amount)}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {experience.price.per}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSelect}
                className="hover:border-primary hover:text-primary"
              >
                Details
              </Button>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  ref={addButtonRef}
                  size="sm"
                  variant={isInTrip ? 'secondary' : 'default'}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = addButtonRef.current?.getBoundingClientRect();
                    if (rect) {
                      onQuickAdd(rect);
                    }
                  }}
                  className={`gap-1.5 shadow-md min-w-[85px] ${isInTrip ? 'bg-success/10 text-success hover:bg-success/20 border-success/30' : ''}`}
                >
                  <AnimatePresence mode="wait">
                    {isInTrip ? (
                      <motion.div
                        key="added"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Added
                      </motion.div>
                    ) : (
                      <motion.div
                        key="add"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
