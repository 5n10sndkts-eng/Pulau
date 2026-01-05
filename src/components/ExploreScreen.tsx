import { Experience } from '@/lib/types'
import { experiences } from '@/lib/mockData'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  TrendingUp, 
  Gem, 
  AlertCircle, 
  MapPin, 
  Star,
  ChevronRight,
  Flame
} from 'lucide-react'
import { motion } from 'framer-motion'

interface ExploreScreenProps {
  onViewExperience: (experienceId: string) => void
  onSearch?: (query: string) => void
}

export function ExploreScreen({ onViewExperience, onSearch }: ExploreScreenProps) {
  // Mock data for trending (top rated with most reviews)
  const trending = experiences
    .sort((a, b) => b.provider.reviewCount - a.provider.reviewCount)
    .slice(0, 6)

  // Hidden gems (high rating, fewer reviews)
  const hiddenGems = experiences
    .filter(exp => exp.provider.rating >= 4.5 && exp.provider.reviewCount < 100)
    .slice(0, 6)

  // Limited availability (mock - just random selection)
  const limitedAvailability = experiences
    .filter(exp => exp.tags?.includes('group'))
    .slice(0, 4)

  const destinationGuides = [
    {
      id: 'ubud',
      name: 'Ubud',
      tagline: 'Culture & Rice Terraces',
      image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&h=600&fit=crop',
    },
    {
      id: 'seminyak',
      name: 'Seminyak',
      tagline: 'Beach & Nightlife',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    },
    {
      id: 'uluwatu',
      name: 'Uluwatu',
      tagline: 'Surf & Cliffs',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop',
    },
    {
      id: 'nusa',
      name: 'Nusa Islands',
      tagline: 'Island Hopping',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    },
  ]

  const ExperienceCard = ({ experience, badge }: { experience: Experience; badge?: React.ReactNode }) => (
    <Card
      className="flex-shrink-0 w-64 overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
      onClick={() => onViewExperience(experience.id)}
    >
      <div className="relative">
        <img
          src={experience.images[0]}
          alt={experience.title}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
        />
        {badge}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold line-clamp-2">{experience.title}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{experience.provider.rating}</span>
          <span>({experience.provider.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">${experience.price.amount}</span>
          <span className="text-xs text-muted-foreground">per {experience.price.per}</span>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Search */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b p-4 space-y-4">
        <h1 className="font-display text-3xl font-bold">Explore Bali</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search experiences..."
            className="pl-10"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-8 p-6">
        {/* Trending Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold">Trending in Bali</h2>
            </div>
            <Button variant="ghost" size="sm">
              See All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {trending.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ExperienceCard
                  experience={exp}
                  badge={
                    <Badge className="absolute top-3 left-3 bg-orange-500 text-white gap-1">
                      <Flame className="h-3 w-3" />
                      Hot
                    </Badge>
                  }
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Hidden Gems Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gem className="h-6 w-6 text-yellow-500" />
              <h2 className="font-display text-2xl font-bold">Hidden Gems</h2>
            </div>
            <Button variant="ghost" size="sm">
              See All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {hiddenGems.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ExperienceCard
                  experience={exp}
                  badge={
                    <Badge className="absolute top-3 left-3 bg-yellow-500 text-white gap-1">
                      <Gem className="h-3 w-3" />
                      Local Secret
                    </Badge>
                  }
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Limited Availability Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-accent" />
              <h2 className="font-display text-2xl font-bold">Limited Availability</h2>
            </div>
            <Button variant="ghost" size="sm">
              See All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {limitedAvailability.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ExperienceCard
                  experience={exp}
                  badge={
                    <Badge className="absolute top-3 left-3 bg-accent text-white gap-1 animate-pulse">
                      <AlertCircle className="h-3 w-3" />
                      Only 3 spots left!
                    </Badge>
                  }
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Destination Guides Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold">Destination Guides</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {destinationGuides.map((guide, index) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group">
                  <div className="relative h-32">
                    <img
                      src={guide.image}
                      alt={guide.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-display text-lg font-bold">{guide.name}</h3>
                      <p className="text-sm text-white/80">{guide.tagline}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Traveler Stories Teaser */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Stories from Travelers</h2>
          </div>
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="text-center space-y-3">
              <div className="text-4xl mb-2">📖</div>
              <h3 className="font-display text-xl font-semibold">Coming Soon</h3>
              <p className="text-muted-foreground">
                Read authentic stories from travelers who've explored Bali
              </p>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
