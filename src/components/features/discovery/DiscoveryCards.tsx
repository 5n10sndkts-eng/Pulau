import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, Gem, Clock, MapPin } from 'lucide-react'
import type { Experience } from '@/lib/types'

interface TrendingExperienceCardProps {
  experience: Experience
  onClick: () => void
}

export function TrendingExperienceCard({ experience, onClick }: TrendingExperienceCardProps) {
  const bookingsThisWeek = Math.floor(Math.random() * 50) + 10

  return (
    <Card 
      className="w-[220px] shrink-0 cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <div className="relative h-[180px]">
        <img
          src={experience.images[0]}
          alt={experience.title}
          className="h-full w-full object-cover"
        />
        <Badge className="absolute right-2 top-2 bg-red-500/90 text-white">
          <Flame className="mr-1 h-3 w-3" />
          {bookingsThisWeek} booked this week
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="line-clamp-2 font-medium text-sm">{experience.title}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-lg font-semibold">
            {experience.price.currency} ${experience.price.amount}
          </span>
          <span className="text-xs text-muted-foreground">/ {experience.price.per}</span>
        </div>
      </CardContent>
    </Card>
  )
}

interface HiddenGemCardProps {
  experience: Experience
  onClick: () => void
}

export function HiddenGemCard({ experience, onClick }: HiddenGemCardProps) {
  return (
    <Card 
      className="w-[200px] shrink-0 cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <div className="relative h-[160px]">
        <img
          src={experience.images[0]}
          alt={experience.title}
          className="h-full w-full object-cover"
        />
        <Badge className="absolute left-2 top-2 bg-emerald-500/90 text-white">
          <Gem className="mr-1 h-3 w-3" />
          Hidden Gem
        </Badge>
      </div>
      <CardContent className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium">{experience.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>Off the beaten path</span>
        </div>
        <div className="mt-2 text-sm font-semibold">
          ${experience.price.amount}
        </div>
      </CardContent>
    </Card>
  )
}

interface LimitedAvailabilityCardProps {
  experience: Experience
  spotsLeft: number
  onClick: () => void
}

export function LimitedAvailabilityCard({ 
  experience, 
  spotsLeft, 
  onClick 
}: LimitedAvailabilityCardProps) {
  return (
    <Card 
      className="cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <div className="flex gap-3 p-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
          <img
            src={experience.images[0]}
            alt={experience.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="line-clamp-1 text-sm font-medium">{experience.title}</h3>
          <div className="mt-1 flex items-center gap-1">
            <Badge variant="destructive" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
            </Badge>
          </div>
          <div className="mt-1 text-sm font-semibold">
            ${experience.price.amount}
          </div>
        </div>
      </div>
    </Card>
  )
}

interface DestinationGuideCardProps {
  title: string
  description: string
  image: string
  onClick: () => void
}

export function DestinationGuideCard({ 
  title, 
  description, 
  image, 
  onClick 
}: DestinationGuideCardProps) {
  return (
    <Card 
      className="w-[280px] shrink-0 cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <div className="relative h-[160px]">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 p-4 text-white">
          <h3 className="font-semibold">{title}</h3>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

interface TravelerStoryCardProps {
  author: string
  country: string
  story: string
  image: string
  onClick: () => void
}

export function TravelerStoryCard({ 
  author, 
  country, 
  story, 
  image, 
  onClick 
}: TravelerStoryCardProps) {
  return (
    <Card 
      className="w-[300px] shrink-0 cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <div className="relative h-[200px]">
        <img
          src={image}
          alt={`Story by ${author}`}
          className="h-full w-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <p className="line-clamp-3 text-sm italic">"{story}"</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div>
            <p className="text-sm font-medium">{author}</p>
            <p className="text-xs text-muted-foreground">{country}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
