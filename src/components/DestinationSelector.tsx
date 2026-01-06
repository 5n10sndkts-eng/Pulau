import { Destination } from '@/lib/types'
import { destinations } from '@/lib/mockData'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Bell } from 'lucide-react'
import { motion } from 'framer-motion'

interface DestinationSelectorProps {
  onSelectDestination: (destinationId: string) => void
}

export function DestinationSelector({ onSelectDestination }: DestinationSelectorProps) {
  const activeDestinations = destinations.filter(d => d.active)
  const comingSoonDestinations = destinations.filter(d => !d.active)

  const handleNotifyMe = (destination: Destination) => {
    alert(`We'll notify you when ${destination.name} launches!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl mb-4">🌏</div>
          <h1 className="font-display text-4xl font-bold">
            Choose Your Destination
          </h1>
          <p className="text-lg text-muted-foreground">
            Select where you'd like to explore amazing experiences
          </p>
        </motion.div>

        {/* Active Destinations */}
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">Available Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDestinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-105 group"
                  onClick={() => onSelectDestination(destination.id)}
                >
                  <div className="relative h-48">
                    <img
                      src={destination.heroImage}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5" />
                        <span className="text-sm">{destination.country}</span>
                      </div>
                      <h3 className="font-display text-3xl font-bold mb-1">
                        {destination.name}
                      </h3>
                      <p className="text-white/90">{destination.tagline}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Coming Soon Destinations */}
        {comingSoonDestinations.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Coming Soon</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comingSoonDestinations.map((destination, index) => (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (activeDestinations.length + index) * 0.1 }}
                >
                  <Card className="overflow-hidden relative">
                    <div className="relative h-40 opacity-60 grayscale">
                      <img
                        src={destination.heroImage}
                        alt={destination.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40" />
                      <Badge className="absolute top-3 right-3 bg-coral text-white">
                        Coming Soon
                      </Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-display text-xl font-bold">
                          {destination.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {destination.country}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => handleNotifyMe(destination)}
                      >
                        <Bell className="h-4 w-4" />
                        Notify Me
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
