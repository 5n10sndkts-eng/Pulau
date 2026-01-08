import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function PerfectForYouBadge({ className }: { className?: string }) {
    return (
        <Badge
            variant="secondary"
            className={`bg-coral-500/10 text-coral-600 border-coral-200 backdrop-blur-sm gap-1.5 ${className}`}
            style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)', color: '#FF6B6B', borderColor: 'rgba(255, 107, 107, 0.2)' }}
        >
            <Star className="w-3 h-3 fill-current" />
            Perfect for you
        </Badge>
    )
}
