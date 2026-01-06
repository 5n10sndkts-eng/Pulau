import { useKV } from '@github/spark/hooks'
import { DollarSign, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { User } from '@/lib/types'

interface CurrencyLanguageSettingsScreenProps {
  onBack: () => void
}

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
]

const languages = [
  { code: 'en', name: 'English' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
]

export function CurrencyLanguageSettingsScreen({ onBack }: CurrencyLanguageSettingsScreenProps) {
  const [user, setUser] = useKV<User>('user', {
    id: '',
    preferences: {},
    saved: [],
    currency: 'USD',
    language: 'en',
  })

  const safeUser = user || {
    id: '',
    preferences: {},
    saved: [],
    currency: 'USD',
    language: 'en',
  }

  const handleCurrencyChange = (currency: string) => {
    setUser((current) => {
      const base = current || {
        id: '',
        preferences: {},
        saved: [],
        currency: 'USD',
        language: 'en',
      }
      return { ...base, currency }
    })
    toast.success('Currency updated')
  }

  const handleLanguageChange = (language: string) => {
    setUser((current) => {
      const base = current || {
        id: '',
        preferences: {},
        saved: [],
        currency: 'USD',
        language: 'en',
      }
      return { ...base, language }
    })
    toast.success('Language updated')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="font-display text-2xl font-semibold">Currency & Language</h1>
        </div>
      </div>

      <div className="container max-w-2xl space-y-6 py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Currency</CardTitle>
                <CardDescription>Choose your preferred currency for pricing</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="currency">Preferred Currency</Label>
              <Select value={safeUser.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Prices will be displayed in your selected currency
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Language</CardTitle>
                <CardDescription>Choose your preferred language</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select value={safeUser.language} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                The app interface will be displayed in your selected language
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
