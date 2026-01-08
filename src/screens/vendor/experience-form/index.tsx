import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ExperienceRecord, ExperienceInclusionRecord, ExperienceCategory, ExperienceStatus, Difficulty, PricePer } from '@/lib/types'
import { Step1BasicInfo } from './Step1BasicInfo'
import { Step2Pricing } from './Step2Pricing'
import { Step3Details } from './Step3Details'
import { Step4Location } from './Step4Location'
import { Step5Inclusions } from './Step5Inclusions'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

interface CreateExperienceScreenProps {
    onBack: () => void
    onComplete: () => void
}

export function CreateExperienceScreen({ onBack, onComplete }: CreateExperienceScreenProps) {
    const [step, setStep] = useState(1)
    const TOTAL_STEPS = 5
    const progress = (step / TOTAL_STEPS) * 100

    // Form State
    const [formData, setFormData] = useState<Partial<ExperienceRecord>>({
        id: crypto.randomUUID(),
        status: ExperienceStatus.Draft,
        priceCurrency: 'USD',
        languages: ['English'],
        vendorId: 'current-user-vendor-id', // Mock ID
        category: undefined,
        pricePer: PricePer.Person,
        difficulty: Difficulty.Easy
    })

    // Inclusions are separate records
    const [inclusions, setInclusions] = useState<ExperienceInclusionRecord[]>([])

    const updateData = (updates: Partial<ExperienceRecord>) => {
        setFormData(prev => ({ ...prev, ...updates }))
    }

    const nextStep = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
    const prevStep = () => setStep(s => Math.max(s - 1, 1))

    const handleSubmit = async () => {
        // Here we would effectively save to "DB" (useKV or API)
        console.log('Creates Experience:', formData)
        console.log('Inclusions:', inclusions)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))

        toast.success('Experience created as draft! 6/12 images required.')
        onComplete() // Navigate to next screen (likely Image Upload)
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card border-b">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold">New Experience</h1>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Step {step} of {TOTAL_STEPS}</span>
                        </div>
                    </div>
                    <Button variant="ghost" onClick={() => {
                        toast.info('Saved as draft')
                        onBack()
                    }}>
                        Save Draft
                    </Button>
                </div>
                <Progress value={progress} className="h-1 rounded-none" />
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 py-8">
                {step === 1 && (
                    <Step1BasicInfo
                        data={formData}
                        updateData={updateData}
                        onNext={nextStep}
                    />
                )}
                {step === 2 && (
                    <Step2Pricing
                        data={formData}
                        updateData={updateData}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                )}
                {step === 3 && (
                    <Step3Details
                        data={formData}
                        updateData={updateData}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                )}
                {step === 4 && (
                    <Step4Location
                        data={formData}
                        updateData={updateData}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                )}
                {step === 5 && (
                    <Step5Inclusions
                        data={formData}
                        updateData={updateData}
                        onNext={handleSubmit}
                        onBack={prevStep}
                        // @ts-ignore - Explicitly passing extra props
                        inclusions={inclusions}
                        setInclusions={setInclusions}
                    />
                )}
            </div>
        </div>
    )
}
