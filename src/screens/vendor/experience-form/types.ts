import { ExperienceRecord } from '@/lib/types'

export interface WizardStepProps {
    data: Partial<ExperienceRecord>
    updateData: (updates: Partial<ExperienceRecord>) => void
    onNext?: () => void
    onBack?: () => void
    isLastStep?: boolean
}
