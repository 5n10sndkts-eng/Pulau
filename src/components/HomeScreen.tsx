import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { categories, destinations } from '@/lib/mockData'
import { formatDateRange, formatPrice } from '@/lib/helpers'
import { Trip } from '@/lib/types'
import { MapPin, Waves, Bike, Sparkles, UtensilsCrossed, Car, Home as HomeIcon, ShoppingBag, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

interface HomeScreenProps {
  trip: Trip
  onCategorySelect: (categoryId: string) => void
  onViewTrip: () => void
}

const categoryIcons: Record<string, LucideIcon> = {
  water_adventures: Waves,
  land_explorations: Bike,
  culture_experiences: Sparkles,
  food_nightlife: UtensilsCrossed,
  transportation: Car,
  stays: HomeIcon,
}

export function HomeScreen({ trip, onCategorySelect, onViewTrip }: HomeScreenProps) {
  const destination = destinations.find((d) => d.id === trip.destination)
  const hasItems = trip.items.length > 0

  return (
    <div className="min-h-screen bg-background pb-32">
      <header
        className="relative h-64 bg-cover bg-center"
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

      <section className="px-6 py-8">
        {!hasItems ? (
          <motion.div 
            className="text-center py-16 space-y-6"
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
              <p className="text-muted-foreground text-lg">What sounds amazing?</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="font-display text-xl font-semibold mb-4">Your Trip Preview</h2>
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
