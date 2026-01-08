import { Badge } from '@/components/ui/badge'
import { PremiumContainer } from '@/components/ui/premium-container'
import { fadeInUp } from '@/components/ui/motion.variants'
import { motion } from 'framer-motion'
import { Experience } from '@/lib/types'
import { Shield, MessageSquare, Award, Clock } from 'lucide-react'

interface HostProfileProps {
    provider: Experience['provider']
}

export function HostProfile({ provider }: HostProfileProps) {
    return (
        <motion.div variants={fadeInUp} className="mt-12">
            <PremiumContainer variant="glass" className="p-6 border-primary/5 rounded-3xl">
                <div className="flex gap-4 items-center mb-6">
                    <div className="relative">
                        <img
                            src={provider.photo}
                            alt={provider.name}
                            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary/5 shadow-xl"
                        />
                        {provider.verified && (
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-background">
                                <Shield className="w-3.5 h-3.5 fill-current" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-display text-lg font-bold">{provider.name}</h3>
                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            Local Host since {provider.since}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-[10px] rounded-full px-3 py-0.5 bg-primary/10 text-primary border-none">
                                {provider.rating} Rating
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] rounded-full px-3 py-0.5 border-none">
                                Responds {provider.responseTime}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-foreground/80 leading-relaxed italic">
                        "{provider.bio}"
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                < Award className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Expertise</p>
                                <p className="text-xs font-semibold">Local Guide</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</p>
                                <p className="text-xs font-semibold">Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </PremiumContainer>
        </motion.div>
    )
}
