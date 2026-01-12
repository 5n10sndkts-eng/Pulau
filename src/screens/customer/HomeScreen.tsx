import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { categories, destinations } from '@/lib/mockData'
import { formatDateRange, formatPrice, getPreferenceBasedSections, PreferenceSection } from '@/lib/helpers'
import { Trip, UserPreferences, Experience } from '@/lib/types'
import { MapPin, Waves, Bike, Sparkles, UtensilsCrossed, Car, Home as HomeIcon, ShoppingBag, Calendar, Star, Clock, Users, Plus, ChevronRight, Search, Compass } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PreferenceChips } from './PreferenceChips'
import { dataService } from '@/lib/dataService'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface HomeScreenProps {
  trip: Trip
  userPreferences: UserPreferences
  onCategorySelect: (categoryId: string) => void
  onViewTrip: () => void
  onExperienceSelect: (experienceId: string) => void
  onQuickAdd: (experience: Experience) => void
  onPreferenceChange: (preferences: UserPreferences) => void
}

const categoryIcons: Record<string, React.ElementType> = {
  water_adventures: Waves,
  land_explorations: Bike,
  culture_experiences: Sparkles,
  food_nightlife: UtensilsCrossed,
  transportation: Car,
  stays: HomeIcon,
}

export function HomeScreen({
  trip,
  userPreferences,
  onCategorySelect,
  onViewTrip,
  onExperienceSelect,
  onQuickAdd,
  onPreferenceChange
}: HomeScreenProps) {
  const navigate = useNavigate()
  const destination = destinations.find((d) => d.id === trip.destination)
  const hasItems = trip.items.length > 0

  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadData = async () => { // Fixed duplicate function name
      try {
        const data = await dataService.getExperiences()
        setExperiences(data)
      } catch (error) {
        console.error('Failed to load experiences:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Get preference-based sections
  const preferenceSections = getPreferenceBasedSections(
    userPreferences.travelStyles,
    userPreferences.groupType,
    userPreferences.budget,
    experiences
  )

  // Handle search submission - navigate to explore with search query
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/explore')
    }
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header
        className="relative h-56 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${destination?.heroImage})`,
        }}
        role="banner"
      >
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5" aria-hidden="true" />
            <span className="font-body text-sm">
              {destination?.name}, {destination?.country}
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">{destination?.tagline}</h1>
          <p className="font-body text-sm opacity-90">{formatDateRange(trip.startDate, trip.endDate)}</p>
        </div>
      </header>

      <section className="px-6 py-6 space-y-8">
        {/* Search Bar (AC #4) */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search experiences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12 rounded-xl bg-muted/50 border-transparent focus:border-primary"
            aria-label="Search for experiences"
          />
        </form>

        {/* Preference Chips */}
        <PreferenceChips
          preferences={userPreferences}
          onPreferenceChange={onPreferenceChange}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse space-y-4">
            <div className="h-40 w-40 bg-muted rounded-full"></div>
            <div className="h-4 w-48 bg-muted rounded"></div>
          </div>
        )}

        {/* Personalized Sections */}
        {!isLoading && (
          <AnimatePresence mode="popLayout">
            {preferenceSections.map((section, sectionIdx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: sectionIdx * 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">{section.emoji}</span>
                    <div>
                      <h2 className="font-display text-xl font-bold">{section.title}</h2>
                      <p className="text-sm text-muted-foreground">{section.subtitle}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary">
                    See all <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <ScrollArea className="w-full">
                  <div className="flex gap-4 pb-4">
                    {section.experiences.map((exp) => (
                      <ExperienceCard
                        key={exp.id}
                        experience={exp}
                        onSelect={() => onExperienceSelect(exp.id)}
                        onQuickAdd={() => onQuickAdd(exp)}
                      />
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Empty State when no preferences */}
        {!isLoading && preferenceSections.length === 0 && !hasItems && (
          <motion.div
            className="text-center py-12 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-7xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              aria-hidden="true"
            >
              ✨
            </motion.div>
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Your Bali story starts here
              </h2>
              <p className="text-muted-foreground text-lg">Select your travel style above for personalized picks</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
          </motion.div>
        )}

        {/* Trip Preview */}
        {hasItems && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="font-display text-xl font-semibold">Your Trip Preview</h2>
            <div className="grid grid-cols-2 gap-3" role="list">
              {trip.items.slice(0, 4).map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  role="listitem"
                >
                  <Card className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 hover:shadow-lg transition-shadow">
                    <div className="w-full h-full flex items-center justify-center text-5xl" aria-label={`Trip item ${idx + 1}`}>
                      {idx === 0 ? '🚤' : idx === 1 ? '🏔️' : idx === 2 ? '🍜' : '🏝️'}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Categories Grid */}
        <div className="space-y-4">
          <h2 id="explore-heading" className="font-display text-2xl font-bold">Explore Experiences</h2>
          <div className="grid grid-cols-2 gap-4" role="list" aria-labelledby="explore-heading">
            {categories.map((category, idx) => {
              const Icon = categoryIcons[category.id] || Sparkles
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  role="listitem"
                >
                  <Card
                    className="relative overflow-hidden cursor-pointer group transition-all hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    onClick={() => onCategorySelect(category.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onCategorySelect(category.id)
                      }
                    }}
                    aria-label={`Browse ${category.name}: ${category.tagline}`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{
                        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url(${category.image})`,
                      }}
                      aria-hidden="true"
                    />
                    <div className="relative p-6 h-44 flex flex-col justify-end text-white">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors" aria-hidden="true">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-display font-bold text-base leading-tight">{category.name}</h3>
                      <p className="text-xs opacity-90 mt-1.5">{category.tagline}</p>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Explore All Button (AC #3) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 gap-2 text-base border-2 border-primary/30 hover:border-primary hover:bg-primary/5"
              onClick={() => navigate('/explore')}
            >
              <Compass className="w-5 h-5" />
              Explore All Experiences
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {hasItems && (
        <motion.aside
          className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          aria-label="Trip summary"
        >
          <Card className="p-4 shadow-2xl bg-card border-2 border-primary/20 pointer-events-auto">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <motion.div
                  className="bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`${trip.items.length} items in trip`}
                >
                  {trip.items.length}
                </motion.div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Estimated Total</p>
                  <p className="font-display text-xl font-bold">{formatPrice(trip.total)}</p>
                </div>
              </div>
              <Button onClick={onViewTrip} size="lg" className="shadow-lg">
                <ShoppingBag className="w-5 h-5 mr-2" aria-hidden="true" />
                View Trip
              </Button>
            </div>
          </Card>
        </motion.aside>
      )}
    </div>
  )
}

// Compact Experience Card for horizontal scrolling
function ExperienceCard({
  experience,
  onSelect,
  onQuickAdd,
}: {
  experience: Experience
  onSelect: () => void
  onQuickAdd: () => void
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="w-[260px] shrink-0"
    >
      <Card className="overflow-hidden cursor-pointer group h-full">
        <div className="relative h-36" onClick={onSelect}>
          <img
            src={experience.images[0]}
            alt={experience.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Preference badges */}
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {experience.price.amount < 50 && (
              <Badge className="bg-emerald-500/90 text-white text-xs">💰 Budget</Badge>
            )}
            {experience.groupSize.min === 1 && (
              <Badge className="bg-blue-500/90 text-white text-xs">🎒 Solo OK</Badge>
            )}
            {experience.tags?.includes('private') && (
              <Badge className="bg-pink-500/90 text-white text-xs">💕 Private</Badge>
            )}
            {(experience.tags?.includes('wellness') || experience.tags?.includes('yoga')) && (
              <Badge className="bg-emerald-500/90 text-white text-xs">🧘 Wellness</Badge>
            )}
          </div>
        </div>
        <div className="p-4 space-y-2" onClick={onSelect}>
          <h3 className="font-display font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {experience.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {experience.duration}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-golden text-golden" />
              {experience.provider.rating}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className="font-display font-bold text-lg">
              {formatPrice(experience.price.amount)}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                / {experience.price.per}
              </span>
            </p>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              onClick={(e) => {
                e.stopPropagation()
                onQuickAdd()
              }}
            >
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
