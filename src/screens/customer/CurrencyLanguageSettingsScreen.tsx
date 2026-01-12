import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { DollarSign, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
import { isRtl } from '@/lib/i18n'
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
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
]

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
]

export function CurrencyLanguageSettingsScreen({ onBack }: CurrencyLanguageSettingsScreenProps) {
  const { t, i18n } = useTranslation()

  const defaultUser: User = {
    id: '',
    name: '',
    email: '',
    preferences: {},
    saved: [],
    currency: 'USD',
    language: 'en',
  }

  const [user, setUser] = useKV<User>('user', defaultUser)

  const safeUser = user || defaultUser

  // Sync i18n language with user preference on mount
  useEffect(() => {
    if (safeUser.language && safeUser.language !== i18n.language) {
      i18n.changeLanguage(safeUser.language)
    }
  }, [safeUser.language, i18n])

  // Update document direction for RTL languages
  useEffect(() => {
    const dir = isRtl(i18n.language) ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  const handleCurrencyChange = (currency: string) => {
    setUser((current) => {
      const base = current || defaultUser
      return { ...base, currency }
    })
    toast.success(t('settings.currencyUpdated'))
  }

  const handleLanguageChange = (language: string) => {
    setUser((current) => {
      const base = current || defaultUser
      return { ...base, language }
    })
    // Change i18n language immediately
    i18n.changeLanguage(language)
    // Store in localStorage for persistence
    localStorage.setItem('pulau-language', language)
    toast.success(t('settings.languageUpdated'))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← {t('common.back')}
          </Button>
          <h1 className="font-display text-2xl font-semibold">{t('profile.currencyLanguage')}</h1>
        </div>
      </div>

      <div className="container max-w-2xl space-y-6 py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>{t('settings.currency')}</CardTitle>
                <CardDescription>{t('settings.currencyDescription')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="currency">{t('settings.preferredCurrency')}</Label>
              <Select value={safeUser.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder={t('settings.preferredCurrency')} />
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
                {t('settings.priceDisplayNote')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>{t('settings.language')}</CardTitle>
                <CardDescription>{t('settings.languageDescription')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="language">{t('settings.preferredLanguage')}</Label>
              <Select value={safeUser.language} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language">
                  <SelectValue placeholder={t('settings.preferredLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.nativeName} ({language.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t('settings.languageDisplayNote')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
