import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, MapPin, Calendar } from 'lucide-react'
import type { Destination } from '@/lib/types'

interface DestinationTeaserCardProps {
  destination: Destination
  onNotifyMe: (destinationId: string) => void
}

export function DestinationTeaserCard({ destination, onNotifyMe }: DestinationTeaserCardProps) {
  if (destination.active) {
    return null
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-[200px]">
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <Badge className="absolute right-3 top-3 bg-primary/90 text-primary-foreground">
          <Sparkles className="mr-1 h-3 w-3" />
          Coming Soon
        </Badge>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-2xl font-bold text-white">
            {destination.name}
          </h3>
          <p className="mt-1 text-sm text-white/90">{destination.tagline}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
            <MapPin className="h-3 w-3" />
            <span>{destination.country}</span>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Launching soon</span>
          </div>
          <Button onClick={() => onNotifyMe(destination.id)} className="w-full">
            Notify Me When Available
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Be the first to explore {destination.name} when we launch
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface DestinationConfigDisplayProps {
  destination: Destination
}

export function DestinationConfigDisplay({ destination }: DestinationConfigDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-3">
          <p className="text-sm font-medium text-muted-foreground">Currency</p>
          <p className="mt-1 text-lg font-semibold">{destination.currency}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-sm font-medium text-muted-foreground">Timezone</p>
          <p className="mt-1 text-lg font-semibold">{destination.timezone}</p>
        </div>
      </div>
      
      <div className="rounded-lg border p-3">
        <p className="text-sm font-medium text-muted-foreground">Status</p>
        <div className="mt-1">
          {destination.active ? (
            <Badge variant="default">Active</Badge>
          ) : (
            <Badge variant="secondary">Coming Soon</Badge>
          )}
        </div>
      </div>
    </div>
  )
}
