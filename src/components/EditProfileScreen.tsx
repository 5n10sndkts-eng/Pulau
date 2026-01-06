import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Camera, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import type { User as UserType } from '@/lib/types'

interface EditProfileScreenProps {
  onBack: () => void
}

export function EditProfileScreen({ onBack }: EditProfileScreenProps) {
  const [user, setUser] = useKV<UserType>('user', {
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

  const [firstName, setFirstName] = useState(safeUser.firstName || '')
  const [lastName, setLastName] = useState(safeUser.lastName || '')
  const [email, setEmail] = useState(safeUser.email || '')
  const [phone, setPhone] = useState('')

  const handleSave = () => {
    setUser((current) => {
      const base = current || {
        id: '',
        preferences: {},
        saved: [],
        currency: 'USD',
        language: 'en',
      }
      return {
        ...base,
        firstName,
        lastName,
        email,
      }
    })
    toast.success('Profile updated')
    onBack()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            Cancel
          </Button>
          <h1 className="font-display text-xl font-semibold">Edit Profile</h1>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      <div className="container max-w-2xl space-y-6 py-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
