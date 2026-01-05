import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Experience, FilterType, UserPreferences } from '@/lib/types'
import { getExperiencesByCategory, filterExperiences, formatPrice, getRecommendedExperiences } from '@/lib/helpers'
import { categories } from '@/lib/mockData'
import { ArrowLeft, Search, Clock, Users, Star, Heart, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

interface CategoryBrowserProps {
  categoryId: string
  userPreferences?: UserPreferences
  savedExperiences: string[]
  onBack: () => void
  onExperienceSelect: (experienceId: string) => void
  onQuickAdd: (experience: Experience) => void
  onToggleSave: (experienceId: string) => void
}

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'beginner', label: 'Beginner Friendly' },
  { id: 'halfday', label: 'Half Day' },
  { id: 'fullday', label: 'Full Day' },
  { id: 'private', label: 'Private' },
  { id: 'group', label: 'Group' },
  { id: 'under50', label: 'Under $50' },
  { id: 'toprated', label: 'Top Rated' },
]

export function CategoryBrowser({
  categoryId,
  userPreferences,
  savedExperiences,
  onBack,
  onExperienceSelect,
  onQuickAdd,
  onToggleSave,
}: CategoryBrowserProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const category = categories.find((c) => c.id === categoryId)
  const allExperiences = getExperiencesByCategory(categoryId)
  const filteredExps = filterExperiences(allExperiences, activeFilter)

  const recommendedExp = userPreferences
    ? getRecommendedExperiences(categoryId, userPreferences.travelStyle, userPreferences.groupType)[0]
    : null

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-2xl font-bold flex-1">{category?.name}</h1>
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-2 px-4 pb-4">
            {filters.map((filter) => (
              <Badge
                key={filter.id}
                variant={activeFilter === filter.id ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="p-4 space-y-6">
        {recommendedExp && activeFilter === 'all' && (
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-start gap-2 mb-3">
              <Star className="w-5 h-5 text-golden fill-golden" />
              <div className="flex-1">
                <h3 className="font-display font-semibold">Perfect for you</h3>
                <p className="text-sm text-muted-foreground">Based on your preferences</p>
              </div>
            </div>
            <ExperienceCard
              experience={recommendedExp}
              isSaved={savedExperiences.includes(recommendedExp.id)}
              onSelect={() => onExperienceSelect(recommendedExp.id)}
              onQuickAdd={() => onQuickAdd(recommendedExp)}
              onToggleSave={() => onToggleSave(recommendedExp.id)}
            />
          </Card>
        )}

        {filteredExps.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-display text-xl font-semibold">No experiences match these filters</h3>
            <p className="text-muted-foreground">Try adjusting your filters or explore all options</p>
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
                onSelect={() => onExperienceSelect(exp.id)}
                onQuickAdd={() => onQuickAdd(exp)}
                onToggleSave={() => onToggleSave(exp.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ExperienceCard({
  experience,
  isSaved,
  onSelect,
  onQuickAdd,
  onToggleSave,
}: {
  experience: Experience
  isSaved: boolean
  onSelect: () => void
  onQuickAdd: () => void
  onToggleSave: () => void
}) {
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
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm shadow-sm">
              {experience.provider.name}
            </Badge>
          </div>
          <motion.button
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSave()
            }}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              animate={isSaved ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-5 h-5 transition-colors ${isSaved ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
            </motion.div>
          </motion.button>
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-display text-lg font-semibold leading-tight cursor-pointer group-hover:text-primary transition-colors" onClick={onSelect}>
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
                Max {experience.groupSize.max} {experience.groupSize.max === 1 ? 'person' : 'people'}
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
              <p className="text-xs text-muted-foreground uppercase tracking-wide">From</p>
              <p className="font-display text-2xl font-bold">
                {formatPrice(experience.price.amount)} 
                <span className="text-sm font-normal text-muted-foreground ml-1">/ {experience.price.per}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onSelect} className="hover:border-primary hover:text-primary">
                Details
              </Button>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onQuickAdd()
                  }}
                  className="gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
