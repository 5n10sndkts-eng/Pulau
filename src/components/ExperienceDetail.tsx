import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Experience } from '@/lib/types'
import { formatPrice } from '@/lib/helpers'
import { Skeleton } from '@/components/ui/skeleton'
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar'
import { SoldOutOverlay } from '@/components/ErrorHandling'
import {
  ArrowLeft,
  Heart,
  Clock,
  Users,
  BarChart3,
  Check,
  X,
  Star,
  MapPin,
  Shield,
  Share2,
  Info,
  CalendarDays,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PremiumContainer } from '@/components/ui/premium-container'
import { fadeInUp, staggerContainer } from '@/components/ui/motion.variants'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { HostProfile } from '@/components/HostProfile'
import { ReviewList } from '@/components/ReviewList'

interface ExperienceDetailProps {
  experience: Experience
  isSaved: boolean
  onBack: () => void
  onToggleSave: () => void
  onAddToTrip: (guests: number, totalPrice: number) => void
}

export function ExperienceDetail({ experience, isSaved, onBack, onToggleSave, onAddToTrip }: ExperienceDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [guests, setGuests] = useState(2)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

  const totalPrice = useMemo(() => experience.price.amount * guests, [experience.price.amount, guests])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: experience.title,
          text: `Check out this amazing experience: ${experience.title} in Bali!`,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleWaitlist = () => {
    toast.success("You've been added to the waitlist! We'll notify you if spots open up.")
    setShowWaitlist(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-body">
        {/* Skeleton Hero */}
        <div className="relative h-[50vh] overflow-hidden bg-muted">
          <Skeleton className="absolute inset-0 w-full h-full" />
          <div className="absolute top-6 left-6 z-20">
            <Skeleton className="w-11 h-11 rounded-full" />
          </div>
        </div>

        <PremiumContainer className="relative -mt-20 z-10 pb-20">
          <div className="bg-background rounded-[2rem] p-8 md:p-12 shadow-2xl space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </PremiumContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Immersive Header / Hero */}
      <section className="relative h-[50vh] overflow-hidden bg-muted">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={experience.images[currentImageIndex]}
            alt={experience.title}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />

        {/* Top Controls */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <Button
            variant="ghost"
            size="icon"
            className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/40"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/40"
              onClick={handleShare}
              aria-label="Share experience"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-11 h-11 rounded-full backdrop-blur-md border border-white/20 transition-all",
                isSaved ? "bg-accent text-white border-accent" : "bg-white/20 text-white hover:bg-white/40"
              )}
              onClick={onToggleSave}
              aria-label={isSaved ? "Remove from saved" : "Save experience"}
            >
              <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
            </Button>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-20" role="tablist" aria-label="Image gallery">
          {experience.images.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === currentImageIndex}
              aria-label={`Go to image ${idx + 1}`}
              onClick={() => setCurrentImageIndex(idx)}
              className="group focus:outline-none"
            >
              <motion.div
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  idx === currentImageIndex ? "bg-white w-8" : "bg-white/40 w-1.5 group-hover:bg-white/60"
                )}
                animate={{ width: idx === currentImageIndex ? 32 : 6 }}
              />
            </button>
          ))}
        </div>
      </section>

      {/* Content Section */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative z-10 -mt-10 bg-background rounded-t-[40px] px-6 pt-10 pb-40"
      >
        {/* Title & Stats */}
        <motion.div variants={fadeInUp} className="space-y-4">
          <div className="flex justify-between items-start gap-4">
            <h1 className="font-display text-3xl font-bold leading-tight flex-1">{experience.title}</h1>
            <Badge variant="outline" className="shrink-0 mt-2 px-3 py-1 border-primary/20 text-primary uppercase text-[10px] font-bold tracking-widest">
              {experience.category.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-golden text-golden" aria-hidden="true" />
              <span className="font-bold text-foreground">{experience.provider.rating}</span>
              <span>({experience.provider.reviewCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>{experience.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" aria-hidden="true" />
              <span>{experience.difficulty}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" aria-hidden="true" />
              <span>Max {experience.groupSize.max}</span>
            </div>
          </div>
        </motion.div>

        <Separator className="my-8 opacity-50" />

        {/* Description */}
        <motion.div variants={fadeInUp} className="space-y-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            About the Experience
          </h2>
          <div className="text-foreground/80 leading-relaxed text-sm space-y-4">
            {experience.description.split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </motion.div>

        {/* What's Included */}
        <motion.div variants={fadeInUp} className="mt-10 space-y-6">
          <div className="grid gap-6">
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">What's Included</h2>
              <div className="grid gap-3">
                {experience.included.map((item, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {experience.notIncluded.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Not Included</h3>
                <div className="grid gap-3">
                  {experience.notIncluded.map((item, i) => (
                    <div key={i} className="flex gap-3 text-sm text-muted-foreground opacity-70">
                      <X className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Provider Section */}
        <HostProfile provider={experience.provider} />

        {/* Reviews Section */}
        <section className="mt-12">
          <ReviewList
            reviews={experience.reviews}
            rating={experience.provider.rating}
            reviewCount={experience.provider.reviewCount}
          />
        </section>

        {/* Availability */}
        <motion.div variants={fadeInUp} className="mt-12 space-y-4 relative">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Check Availability
          </h2>
          <AvailabilityCalendar
            experienceId={experience.id}
            selectedDate={selectedDate}
            onDateSelect={(date) => {
              if (date === '2024-08-15') { // Mock sold out date
                setShowWaitlist(true)
              } else {
                setSelectedDate(date)
              }
            }}
          />
          {showWaitlist && (
            <div className="absolute inset-0 z-50">
              <SoldOutOverlay onWaitlist={handleWaitlist} onViewSimilar={() => setShowWaitlist(false)} />
            </div>
          )}
        </motion.div>

        {/* Good to Know */}
        <motion.div variants={fadeInUp} className="mt-12 space-y-6">
          <h2 className="font-display text-xl font-bold">Good to Know</h2>
          <Card className="p-5 border-none bg-primary/5 rounded-2xl space-y-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-bold">Cancellation Policy</p>
                <p className="text-xs text-muted-foreground">{experience.cancellation}</p>
              </div>
            </div>
            {experience.whatToBring.length > 0 && (
              <div className="flex gap-3 pt-2">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-bold">What to Bring</p>
                  <p className="text-xs text-muted-foreground">{experience.whatToBring.join(', ')}</p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
        <PremiumContainer variant="glass" className="pointer-events-auto max-w-lg mx-auto flex items-center justify-between p-4 rounded-3xl shadow-2xl border-white/20 backdrop-blur-2xl">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Price</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-display font-bold">{formatPrice(totalPrice)}</span>
              <span className="text-[10px] text-muted-foreground">/ {guests} guests</span>
            </div>
          </div>
          <Button
            size="lg"
            className="rounded-2xl px-8 font-bold h-14 shadow-lg shadow-primary/25"
            onClick={() => onAddToTrip(guests, totalPrice)}
          >
            Add to Trip
          </Button>
        </PremiumContainer>
      </div>
    </div>
  )
}
