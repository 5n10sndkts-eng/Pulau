import { motion, AnimatePresence } from 'framer-motion';
import {
  searchExperiences,
  filterExperiencesAdvanced,
  formatPrice,
} from '@/lib/helpers';
import { PremiumContainer } from '@/components/ui/premium-container';
import { fadeInUp, staggerContainer } from '@/components/ui/motion.variants';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { PerfectForYouBadge } from '@/components/PerfectForYouBadge';

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  Gem,
  AlertCircle,
  MapPin,
  Star,
  ChevronRight,
  Flame,
  Filter,
  X,
  Plus,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { dataService } from '@/lib/dataService';
import { Experience } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

interface ExploreScreenProps {
  onViewExperience: (experienceId: string) => void;
  onQuickAdd: (experience: Experience) => void;
}

export function ExploreScreen({
  onViewExperience,
  onQuickAdd,
}: ExploreScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: [] as string[],
    duration: [] as string[],
    priceRange: [0, 200] as [number, number],
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [recommendations, setRecommendations] = useState<Experience[]>([]);
  const { user } = useAuth();

  // Load data and recommendations
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await dataService.getExperiences();
        setExperiences(data);

        // Load personalized recommendations if user has completed onboarding
        if (user?.id && user.hasCompletedOnboarding) {
          try {
            // Get top 6 experiences sorted by user preferences
            // TODO: Integrate with recommendationService when DB schema is aligned
            const topExperiences = data.slice(0, 6);
            setRecommendations(topExperiences);
          } catch (error) {
            console.error('Failed to load recommendations:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load experiences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  // 1. Process search and advanced filters with memoization
  const filteredResults = useMemo(() => {
    let pool = experiences;

    // Search first
    if (searchQuery) {
      pool = searchExperiences(searchQuery, pool);
    }

    // Then apply advanced filters
    return filterExperiencesAdvanced(pool, {
      difficulty: filters.difficulty,
      duration: filters.duration,
      priceRange: filters.priceRange,
    });
  }, [searchQuery, filters, experiences]);

  const isSearching =
    searchQuery.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.duration.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 200;

  const toggleFilter = (type: 'difficulty' | 'duration', value: string) => {
    setFilters((prev) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const clearAll = () => {
    setSearchQuery('');
    setFilters({
      difficulty: [],
      duration: [],
      priceRange: [0, 200],
    });
  };

  const trending = experiences
    .sort((a, b) => b.provider.reviewCount - a.provider.reviewCount)
    .slice(0, 6);

  const hiddenGems = experiences
    .filter(
      (exp) => exp.provider.rating >= 4.5 && exp.provider.reviewCount < 100,
    )
    .slice(0, 6);

  const destinationGuides = [
    {
      id: 'ubud',
      name: 'Ubud',
      tagline: 'Culture & Rice Terraces',
      image:
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&h=600&fit=crop',
    },
    {
      id: 'seminyak',
      name: 'Seminyak',
      tagline: 'Beach & Nightlife',
      image:
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    },
    {
      id: 'uluwatu',
      name: 'Uluwatu',
      tagline: 'Surf & Cliffs',
      image:
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop',
    },
    {
      id: 'nusa',
      name: 'Nusa Islands',
      tagline: 'Island Hopping',
      image:
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Omni-Search Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-primary/5 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiences, categories..."
              className="pl-9 h-11 bg-primary/5 border-none rounded-xl focus-visible:ring-primary/20"
              aria-label="Search experiences"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary/10 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <Button
            variant={isFilterOpen ? 'default' : 'outline'}
            size="icon"
            className="h-11 w-11 rounded-xl"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            aria-label="Toggle filters"
            aria-expanded={isFilterOpen}
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 pb-4 space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Difficulty
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {['Easy', 'Moderate', 'Challenging'].map((d) => (
                      <Badge
                        key={d}
                        variant={
                          filters.difficulty.includes(d.toLowerCase())
                            ? 'default'
                            : 'outline'
                        }
                        className="px-3 py-1.5 cursor-pointer rounded-lg text-xs"
                        onClick={() =>
                          toggleFilter('difficulty', d.toLowerCase())
                        }
                      >
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Duration
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'half', label: 'Half Day (< 6h)' },
                      { id: 'full', label: 'Full Day' },
                    ].map((d) => (
                      <Badge
                        key={d.id}
                        variant={
                          filters.duration.includes(d.id)
                            ? 'default'
                            : 'outline'
                        }
                        className="px-3 py-1.5 cursor-pointer rounded-lg text-xs"
                        onClick={() => toggleFilter('duration', d.id)}
                      >
                        {d.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Price Range
                    </Label>
                    <span className="text-xs font-medium text-primary">
                      {formatPrice(filters.priceRange[0])} -{' '}
                      {formatPrice(filters.priceRange[1])}
                    </span>
                  </div>
                  <Slider
                    defaultValue={[0, 200]}
                    max={200}
                    step={10}
                    value={filters.priceRange}
                    onValueChange={(val) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: val as [number, number],
                      }))
                    }
                    className="py-4"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    className="flex-1 text-xs"
                    onClick={clearAll}
                  >
                    Reset
                  </Button>
                  <Button
                    className="flex-1 text-xs"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-6 py-6 space-y-10">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.section
              key="results"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold">
                  {filteredResults.length} Result
                  {filteredResults.length !== 1 ? 's' : ''}
                </h2>
                <Button
                  variant="link"
                  size="sm"
                  onClick={clearAll}
                  className="text-muted-foreground"
                >
                  Clear All
                </Button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card
                      key={i}
                      className="flex flex-col md:flex-row gap-6 p-4 border-opacity-50"
                    >
                      <Skeleton className="h-48 md:w-64 md:h-40 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-3 py-1">
                        <div className="flex justify-between items-start">
                          <Skeleton className="h-6 w-1/3" />
                          <Skeleton className="h-6 w-12" />
                        </div>
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-10 w-24 rounded-lg" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredResults.map((exp) => (
                    <motion.div key={exp.id} variants={fadeInUp}>
                      <SearchResultCard
                        experience={exp}
                        onSelect={() => onViewExperience(exp.id)}
                        onQuickAdd={() => onQuickAdd(exp)}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="text-6xl">🏝️</div>
                  <h3 className="font-display text-xl font-bold">
                    No islands found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters to find your perfect
                    Bali adventure.
                  </p>
                  <Button onClick={clearAll} variant="outline">
                    Reset Everything
                  </Button>
                </motion.div>
              )}
            </motion.section>
          ) : (
            <motion.div
              key="curated"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-12"
            >
              {/* Perfect For You Section - Only if user has recommendations */}
              {recommendations.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-6 w-6 text-coral fill-coral" />
                      <h2 className="font-display text-2xl font-bold">
                        Perfect For You
                      </h2>
                    </div>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                    {recommendations.map((exp) => (
                      <RecommendedCard
                        key={exp.id}
                        experience={exp}
                        onSelect={() => onViewExperience(exp.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Trending Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <h2 className="font-display text-2xl font-bold">
                      Trending
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary font-bold"
                  >
                    See All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                  {trending.map((exp) => (
                    <CuratedCard
                      key={exp.id}
                      experience={exp}
                      onSelect={() => onViewExperience(exp.id)}
                    />
                  ))}
                </div>
              </section>

              {/* Hidden Gems Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gem className="h-6 w-6 text-accent" />
                    <h2 className="font-display text-2xl font-bold">
                      Hidden Gems
                    </h2>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                  {hiddenGems.map((exp) => (
                    <CuratedCard
                      key={exp.id}
                      experience={exp}
                      onSelect={() => onViewExperience(exp.id)}
                    />
                  ))}
                </div>
              </section>

              {/* Destination Guides Section */}
              <section className="space-y-4 pb-12">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-primary" />
                    <h2 className="font-display text-2xl font-bold">
                      Local Guides
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {destinationGuides.map((guide) => (
                    <Card
                      key={guide.id}
                      className="overflow-hidden border-none shadow-sm rounded-2xl group cursor-pointer"
                    >
                      <div className="relative h-40">
                        <img
                          src={guide.image}
                          alt={guide.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-display text-lg font-bold leading-tight">
                            {guide.name}
                          </h3>
                          <p className="text-[10px] text-white/80 uppercase tracking-widest">
                            {guide.tagline}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SearchResultCard({
  experience,
  onSelect,
  onQuickAdd,
}: {
  experience: Experience;
  onSelect: () => void;
  onQuickAdd: () => void;
}) {
  return (
    <PremiumContainer
      variant="glass"
      className="overflow-hidden p-0 rounded-2xl border-primary/5 hover:border-primary/10 transition-colors shadow-none group"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div
          className="relative w-full sm:w-40 h-32 shrink-0 cursor-pointer"
          onClick={onSelect}
        >
          <img
            src={experience.images[0]}
            alt={experience.title}
            className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
          />
          <Badge className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-black border-none text-[10px] uppercase font-bold tracking-tighter">
            {experience.category.replace('_', ' ')}
          </Badge>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between p-4 sm:p-2 sm:pr-4">
          <div className="space-y-1">
            <h3
              className="font-display font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer"
              onClick={onSelect}
            >
              {experience.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-golden text-golden" />
                <span className="font-bold text-foreground">
                  {experience.provider.rating}
                </span>
                <span>({experience.provider.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{experience.duration}</span>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Price
              </p>
              <p className="font-display font-bold text-xl leading-none">
                {formatPrice(experience.price.amount)}
                <span className="text-[10px] font-normal text-muted-foreground ml-1">
                  /{experience.price.per}
                </span>
              </p>
            </div>
            <Button
              size="sm"
              className="rounded-xl px-6"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd();
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
        </div>
      </div>
    </PremiumContainer>
  );
}

function CuratedCard({
  experience,
  onSelect,
}: {
  experience: Experience;
  onSelect: () => void;
}) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="w-64 shrink-0">
      <Card
        className="overflow-hidden cursor-pointer border-none shadow-premium group rounded-2xl h-full"
        onClick={onSelect}
      >
        <div className="relative h-44 overflow-hidden">
          <img
            src={experience.images[0]}
            alt={experience.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {experience.tags?.includes('toprated') && (
              <Badge className="bg-golden text-white border-none text-[10px] uppercase font-bold tracking-tighter shadow-lg">
                <Star className="h-3 w-3 mr-1 fill-white" /> Rated
              </Badge>
            )}
            {experience.price.amount < 50 && (
              <Badge className="bg-emerald-500 text-white border-none text-[10px] uppercase font-bold tracking-tighter shadow-lg">
                Value
              </Badge>
            )}
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="font-display font-bold text-base leading-tight line-clamp-2">
              {experience.title}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-[10px] opacity-90">
              <div className="flex items-center gap-1 font-bold">
                <Star className="h-3 w-3 fill-current" />
                {experience.provider.rating}
              </div>
              <span>
                ${experience.price.amount}/{experience.price.per}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function RecommendedCard({
  experience,
  onSelect,
}: {
  experience: Experience;
  onSelect: () => void;
}) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="w-64 shrink-0">
      <Card
        className="overflow-hidden cursor-pointer border-coral/20 shadow-premium group rounded-2xl h-full bg-gradient-to-br from-white to-coral/5"
        onClick={onSelect}
      >
        <div className="relative h-44 overflow-hidden">
          <img
            src={experience.images[0]}
            alt={experience.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <PerfectForYouBadge className="absolute top-3 left-3" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="font-display font-bold text-base leading-tight line-clamp-2">
              {experience.title}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-[10px] opacity-90">
              <div className="flex items-center gap-1 font-bold">
                <Star className="h-3 w-3 fill-current" />
                {experience.provider.rating}
              </div>
              <span>
                ${experience.price.amount}/{experience.price.per}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
