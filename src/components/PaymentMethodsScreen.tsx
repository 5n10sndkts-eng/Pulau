import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { CreditCard, Plus, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { PaymentMethod, User } from '@/lib/types'

interface PaymentMethodsScreenProps {
  onBack: () => void
}

const detectCardBrand = (cardNumber: string): PaymentMethod['cardBrand'] => {
  const cleaned = cardNumber.replace(/\s/g, '')
  if (cleaned.startsWith('4')) return 'visa'
  if (cleaned.startsWith('5')) return 'mastercard'
  if (cleaned.startsWith('34') || cleaned.startsWith('37')) return 'amex'
  return 'discover'
}

const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '')
  const groups = cleaned.match(/.{1,4}/g) || []
  return groups.join(' ').slice(0, 19)
}

const luhnCheck = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '')
  if (!/^\d+$/.test(cleaned)) return false
  
  let sum = 0
  let isEven = false
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

export function PaymentMethodsScreen({ onBack }: PaymentMethodsScreenProps) {
  const [user] = useKV<User>('user', {
    id: '',
    preferences: {},
    saved: [],
    currency: 'USD',
    language: 'en',
  })
  
  const [paymentMethods, setPaymentMethods] = useKV<PaymentMethod[]>('paymentMethods', [])
  const [showAddCard, setShowAddCard] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  
  const [cardNumber, setCardNumber] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [cvv, setCvv] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const activeMethods = (paymentMethods || []).filter(pm => !pm.deletedAt)

  const handleAddCard = () => {
    const newErrors: Record<string, string> = {}
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Card number is required'
    } else if (!luhnCheck(cardNumber)) {
      newErrors.cardNumber = 'Invalid card number'
    }
    
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required'
    }
    
    const monthNum = parseInt(expiryMonth)
    const yearNum = parseInt(expiryYear)
    const currentYear = new Date().getFullYear() % 100
    const currentMonth = new Date().getMonth() + 1
    
    if (!expiryMonth || monthNum < 1 || monthNum > 12) {
      newErrors.expiry = 'Invalid month'
    } else if (!expiryYear || yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      newErrors.expiry = 'Card is expired'
    }
    
    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = 'Invalid CVV'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const cleaned = cardNumber.replace(/\s/g, '')
    const lastFour = cleaned.slice(-4)
    const cardBrand = detectCardBrand(cardNumber)
    
    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      userId: (user || { id: '' }).id,
      paymentToken: `tok_${Math.random().toString(36).slice(2)}`,
      lastFour,
      cardBrand,
      expiryMonth: parseInt(expiryMonth),
      expiryYear: parseInt(expiryYear),
      isDefault: activeMethods.length === 0,
      cardholderName,
      createdAt: new Date().toISOString(),
    }

    setPaymentMethods((current) => {
      const base = current || []
      return [...base, newMethod]
    })

    toast.success('Payment method added')
    setShowAddCard(false)
    setCardNumber('')
    setCardholderName('')
    setExpiryMonth('')
    setExpiryYear('')
    setCvv('')
    setErrors({})
  }

  const handleSetDefault = (id: string) => {
    setPaymentMethods((current) => {
      const base = current || []
      return base.map(pm => ({
        ...pm,
        isDefault: pm.id === id
      }))
    })
    toast.success('Default payment method updated')
  }

  const handleDelete = (id: string) => {
    setPaymentMethods((current) => {
      const base = current || []
      return base.map(pm => 
        pm.id === id 
          ? { ...pm, deletedAt: new Date().toISOString() }
          : pm
      )
    })
    toast.success('Payment method removed')
    setDeleteConfirm(null)
  }

  const getCardIcon = () => {
    return <CreditCard className="h-6 w-6" />
  }

  const getBrandName = (brand: PaymentMethod['cardBrand']) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="font-display text-2xl font-semibold">Payment Methods</h1>
        </div>
      </div>

      <div className="container max-w-2xl space-y-4 py-6">
        {activeMethods.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No payment methods saved</p>
              <p className="text-sm text-muted-foreground">Add a card for faster checkout</p>
            </CardContent>
          </Card>
        ) : (
          activeMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  {getCardIcon()}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {getBrandName(method.cardBrand)} •••• {method.lastFour}
                      </span>
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}
                    </p>
                    <p className="text-sm text-muted-foreground">{method.cardholderName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(method.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        <Button onClick={() => setShowAddCard(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add New Card
        </Button>
      </div>

      <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Your card information is securely tokenized. We never store your full card number.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => {
                  setCardNumber(formatCardNumber(e.target.value))
                  setErrors({ ...errors, cardNumber: '' })
                }}
                maxLength={19}
              />
              {errors.cardNumber && (
                <p className="text-sm text-destructive">{errors.cardNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={cardholderName}
                onChange={(e) => {
                  setCardholderName(e.target.value)
                  setErrors({ ...errors, cardholderName: '' })
                }}
              />
              {errors.cardholderName && (
                <p className="text-sm text-destructive">{errors.cardholderName}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Month</Label>
                <Input
                  id="expiryMonth"
                  placeholder="MM"
                  value={expiryMonth}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                    setExpiryMonth(val)
                    setErrors({ ...errors, expiry: '' })
                  }}
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryYear">Year</Label>
                <Input
                  id="expiryYear"
                  placeholder="YY"
                  value={expiryYear}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                    setExpiryYear(val)
                    setErrors({ ...errors, expiry: '' })
                  }}
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  type="password"
                  value={cvv}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setCvv(val)
                    setErrors({ ...errors, cvv: '' })
                  }}
                  maxLength={4}
                />
              </div>
            </div>
            {errors.expiry && (
              <p className="text-sm text-destructive">{errors.expiry}</p>
            )}
            {errors.cvv && (
              <p className="text-sm text-destructive">{errors.cvv}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCard(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCard}>Add Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
