import { AlertTriangle, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Conflict } from '@/lib/conflictDetection'

interface ConflictWarningBannerProps {
  conflict: Conflict
  currentExperienceId: string
  otherExperienceTitle: string
  onTap: () => void
}

export function ConflictWarningBanner({
  conflict,
  currentExperienceId,
  otherExperienceTitle,
  onTap,
}: ConflictWarningBannerProps) {
  const truncatedTitle = otherExperienceTitle.length > 40
    ? otherExperienceTitle.slice(0, 40) + '...'
    : otherExperienceTitle

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="my-2 cursor-pointer rounded-lg border border-[#F4D03F] bg-[#F4D03F33] px-4 py-3 transition-all hover:bg-[#F4D03F40]"
      onClick={onTap}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-[#F39C12]" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">
            Schedule conflict with {truncatedTitle}
          </p>
          <p className="text-xs text-gray-600">
            {conflict.overlapMinutes} minute{conflict.overlapMinutes !== 1 ? 's' : ''} overlap
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-gray-600" />
      </div>
    </motion.div>
  )
}
