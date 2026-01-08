import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Star, ThumbsUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/components/ui/motion.variants'
import { Experience } from '@/lib/types'
import { getCountryFlag } from '@/lib/helpers'
import { cn } from '@/lib/utils'

interface ReviewListProps {
    reviews: Experience['reviews']
    rating: number
    reviewCount: number
}

export function ReviewList({ reviews, rating, reviewCount }: ReviewListProps) {
    const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({})

    const toggleHelpful = (reviewId: string) => {
        setHelpfulVotes(prev => ({
            ...prev,
            [reviewId]: !prev[reviewId]
        }))
    }

    if (reviews.length === 0) {
        return (
            <motion.div variants={fadeInUp} className="mt-12 text-center p-12 border-2 border-dashed border-primary/10 rounded-[32px] bg-primary/5">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-primary/40" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Be the first to review</h3>
                <p className="text-sm text-muted-foreground text-balance">
                    Share your experience with others and help the host grow.
                </p>
            </motion.div>
        )
    }

    return (
        <motion.div variants={fadeInUp} className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold">Traveler Reviews</h2>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-golden text-golden" />
                        <span className="font-display text-xl font-bold">{rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({reviewCount} verified reviews)</span>
                </div>
            </div>

            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-4"
            >
                <AnimatePresence>
                    {reviews.map((review) => (
                        <motion.div key={review.id} variants={fadeInUp}>
                            <Card className="p-6 border-none bg-secondary/30 rounded-[28px] hover:bg-secondary/40 transition-colors">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            {review.author[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-sm">{review.author}</p>
                                                <span className="text-lg" title={`Traveler from ${review.country}`}>
                                                    {getCountryFlag(review.country)}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                                {review.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn(
                                                    "w-3.5 h-3.5",
                                                    i < review.rating ? "fill-golden text-golden" : "text-muted-foreground/30"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-sm text-foreground/85 leading-relaxed mb-4">
                                    {review.text}
                                </p>

                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => toggleHelpful(review.id)}
                                        className={cn(
                                            "flex items-center gap-2 text-[10px] font-bold py-2 px-4 rounded-full transition-all",
                                            helpfulVotes[review.id]
                                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                                : "bg-white/50 text-muted-foreground hover:bg-white hover:text-primary"
                                        )}
                                    >
                                        <ThumbsUp className={cn("w-3 h-3", helpfulVotes[review.id] && "fill-current")} />
                                        {helpfulVotes[review.id] ? "Helpful ✅" : "Helpful?"}
                                        <span className="opacity-50 ml-1">
                                            ({review.helpful + (helpfulVotes[review.id] ? 1 : 0)})
                                        </span>
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            <button className="w-full py-4 rounded-2xl border-2 border-primary/10 font-bold text-sm text-primary hover:bg-primary/5 transition-colors">
                Read all {reviewCount} reviews
            </button>
        </motion.div>
    )
}
