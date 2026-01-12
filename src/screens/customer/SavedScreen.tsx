import { Experience } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Star, Plus, MapPin, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

import { experiences } from '@/lib/mockData'

interface SavedScreenProps {
  savedIds?: string[]
  onToggleSave: (experienceId: string) => void
  onAddToTrip: (experience: Experience) => void
  onViewExperience: (experienceId: string) => void
  onNavigateHome: () => void
  tripItemIds: string[]
}

export function SavedScreen({
  savedIds = [],
  onToggleSave,
  onAddToTrip,
  onViewExperience,
  onNavigateHome,
  tripItemIds,
}: SavedScreenProps) {
  const savedExperiences = experiences.filter((e) => savedIds?.includes(e.id))

  if (savedExperiences.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 pb-24">
        <h1 className="font-display text-3xl font-bold mb-6">Saved Experiences</h1>
        <motion.div
          className="text-center py-16 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="font-display text-2xl font-semibold">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">
            Tap the heart icon on any experience to save it here
          </p>
          <Button onClick={onNavigateHome} size="lg">
            Start Exploring
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Saved Experiences</h1>
        <p className="text-muted-foreground mt-1">
          {savedExperiences.length} {savedExperiences.length === 1 ? 'experience' : 'experiences'} saved
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedExperiences.map((experience, index) => {
          const isInTrip = tripItemIds.includes(experience.id)

          return (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div
                  className="relative cursor-pointer group"
                  onClick={() => onViewExperience(experience.id)}
                >
                  <img
                    src={experience.images[0]}
                    alt={experience.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleSave(experience.id)
                    }}
                    className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                  >
                    <Heart className="h-5 w-5 fill-coral text-coral" />
                  </button>

                  {experience.tags?.includes('toprated') && (
                    <Badge className="absolute top-3 left-3 bg-yellow-500 text-white">
                      Top Rated
                    </Badge>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3
                      className="font-display font-semibold text-lg line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => onViewExperience(experience.id)}
                    >
                      {experience.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {experience.provider.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{experience.provider.rating}</span>
                      <span>({experience.provider.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{experience.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{experience.destination === 'dest_bali' ? 'Bali' : experience.destination}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        ${experience.price.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">per {experience.price.per}</p>
                    </div>

                    {isInTrip ? (
                      <Button variant="outline" disabled size="sm">
                        In Trip
                      </Button>
                    ) : (
                      <Button
                        onClick={() => onAddToTrip(experience)}
                        size="sm"
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add to Trip
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
