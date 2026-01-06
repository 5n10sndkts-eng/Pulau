import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Experience } from '@/lib/types'
import { formatPrice, getCountryFlag } from '@/lib/helpers'
import {
  ArrowLeft,
  Heart,
  Clock,
  Users,
  BarChart3,
  Languages,
  Check,
  X,
  Star,
  MapPin,
  Shield,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'

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
  const [[page, direction], setPage] = useState([0, 0])

  const totalPrice = experience.price.amount * guests

  const handleAddToTrip = () => {
    onAddToTrip(guests, totalPrice)
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    const newIndex = currentImageIndex + newDirection
    if (newIndex >= 0 && newIndex < experience.images.length) {
      setCurrentImageIndex(newIndex)
      setPage([page + newDirection, newDirection])
    }
  }

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
      }
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
      }
    },
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <section className="relative" aria-label="Experience details">
        <div className="relative h-80 bg-gray-200 overflow-hidden" role="region" aria-label="Image gallery">
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={currentImageIndex}
              src={experience.images[currentImageIndex]}
              alt={`${experience.title} - Image ${currentImageIndex + 1} of ${experience.images.length}`}
              className="absolute w-full h-full object-cover"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }: PanInfo) => {
                const swipe = swipePower(offset.x, velocity.x)

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1)
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1)
                }
              }}
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" aria-hidden="true" />

          {currentImageIndex > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={() => paginate(-1)}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </motion.button>
          )}

          {currentImageIndex < experience.images.length - 1 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={() => paginate(1)}
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </motion.button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm hover:bg-white z-10"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Button>

          <motion.button
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={onToggleSave}
            whileTap={{ scale: 0.9 }}
            aria-label={isSaved ? 'Remove from saved' : 'Save experience'}
            aria-pressed={isSaved}
          >
            <motion.div
              animate={isSaved ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-6 h-6 ${isSaved ? 'fill-accent text-accent' : 'text-foreground'}`} aria-hidden="true" />
            </motion.div>
          </motion.button>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10" role="group" aria-label="Image indicators">
            {experience.images.map((_, idx) => (
              <motion.button
                key={idx}
                className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
                }`}
                onClick={() => {
                  const newDirection = idx > currentImageIndex ? 1 : -1
                  setCurrentImageIndex(idx)
                  setPage([idx, newDirection])
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to image ${idx + 1}`}
                aria-current={idx === currentImageIndex ? 'true' : 'false'}
              />
            ))}
          </div>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium z-10" aria-live="polite" aria-atomic="true">
            {currentImageIndex + 1} / {experience.images.length}
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold mb-4">{experience.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{experience.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>
                  {experience.groupSize.min}-{experience.groupSize.max} guests
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span>{experience.difficulty}</span>
              </div>
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-muted-foreground" />
                <span>{experience.languages.join(', ')}</span>
              </div>
            </div>
          </div>

          <Card className="p-6 sticky top-4 z-10 shadow-lg border-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">From</p>
                <p className="font-display text-3xl font-bold">
                  {formatPrice(experience.price.amount)}{' '}
                  <span className="text-base font-normal text-muted-foreground">/ {experience.price.per}</span>
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Guests</span>
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setGuests(Math.max(experience.groupSize.min, guests - 1))}
                    disabled={guests <= experience.groupSize.min}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-bold text-lg w-8 text-center">{guests}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setGuests(Math.min(experience.groupSize.max, guests + 1))}
                    disabled={guests >= experience.groupSize.max}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={handleAddToTrip}>
                Add to Trip - {formatPrice(totalPrice)}
              </Button>

              <p className="text-xs text-center text-muted-foreground">Free cancellation up to 24 hours before</p>
            </div>
          </Card>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-semibold">About This Experience</h2>
            {experience.description.split('\n\n').map((para, idx) => (
              <p key={idx} className="text-foreground/90 leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-semibold">What's Included</h2>
            <div className="space-y-2">
              {experience.included.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/90">{item}</span>
                </div>
              ))}
            </div>

            {experience.notIncluded.length > 0 && (
              <>
                <h3 className="font-display font-semibold mt-4">Not Included</h3>
                <div className="space-y-2">
                  {experience.notIncluded.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <Separator />

          <Card className="p-6 bg-secondary/50">
            <div className="flex gap-4">
              <img src={experience.provider.photo} alt={experience.provider.name} className="w-16 h-16 rounded-full object-cover" />
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold">{experience.provider.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {experience.provider.verified ? '✓ Verified Partner • ' : ''}Family operated since {experience.provider.since}
                </p>
                <p className="text-sm leading-relaxed">{experience.provider.bio}</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary">Local Business</Badge>
                  <Badge variant="secondary">Responds {experience.provider.responseTime}</Badge>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">What Travelers Say</h2>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-golden text-golden" />
                <span className="font-bold text-lg">{experience.provider.rating}</span>
                <span className="text-muted-foreground">({experience.provider.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              {experience.reviews.slice(0, 3).map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">
                        {review.author} {getCountryFlag(review.country)}
                      </p>
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                    </div>
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-golden text-golden" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{review.text}</p>
                  <p className="text-xs text-muted-foreground mt-2">{review.helpful} people found this helpful</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Where You'll Meet</h2>
            <Card className="p-4">
              <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">{experience.meetingPoint.name}</h3>
              {experience.meetingPoint.address && (
                <p className="text-sm text-muted-foreground mb-2">{experience.meetingPoint.address}</p>
              )}
              <p className="text-sm">{experience.meetingPoint.instructions}</p>
            </Card>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Good to Know</h2>
            <Card className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Cancellation Policy
                </h3>
                <p className="text-sm text-muted-foreground">{experience.cancellation}</p>
              </div>
              {experience.whatToBring.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">What to Bring</h3>
                  <p className="text-sm text-muted-foreground">{experience.whatToBring.join(', ')}</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
