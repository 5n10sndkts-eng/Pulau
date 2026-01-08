import { WizardStepProps } from './types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { PricePer } from '@/lib/types'

export function Step2Pricing({ data, updateData, onNext, onBack }: WizardStepProps) {
    const isValid = data.priceAmount && data.priceAmount > 0

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h2 className="text-2xl font-display font-bold">Pricing</h2>
                <p className="text-muted-foreground">Set your price and currency.</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Price Amount *</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.priceAmount || ''}
                            onChange={(e) => updateData({ priceAmount: parseFloat(e.target.value) })}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select
                            value={data.priceCurrency || 'USD'}
                            onValueChange={(val) => updateData({ priceCurrency: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="IDR">IDR (Rp)</SelectItem>
                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                <SelectItem value="AUD">AUD ($)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Per</Label>
                        <Select
                            value={data.pricePer || PricePer.Person}
                            onValueChange={(val) => updateData({ pricePer: val as PricePer })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Per..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={PricePer.Person}>Person</SelectItem>
                                <SelectItem value={PricePer.Group}>Group</SelectItem>
                                <SelectItem value={PricePer.Vehicle}>Vehicle</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={onBack}>
                        Back
                    </Button>
                    <Button onClick={onNext} disabled={!isValid} className="flex-1 md:flex-none">
                        Next: Details
                    </Button>
                </div>
            </div>
        </div>
    )
}
