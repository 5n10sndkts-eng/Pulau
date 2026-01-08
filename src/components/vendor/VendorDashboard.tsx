import { useState, useEffect } from 'react'
import { VendorSession, VendorStats, Experience } from '@/lib/types'
import { vendors } from '@/lib/mockData'
import { vendorService } from '@/lib/vendorService'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Package,
  Calendar,
  DollarSign,
  Star,
  Plus,
  TrendingUp,
  Users,
  Eye
} from 'lucide-react'

interface VendorDashboardProps {
  session: VendorSession
  onNavigateToExperiences: () => void
  onNavigateToBookings: () => void
  onLogout: () => void
}

export function VendorDashboard({
  session,
  onNavigateToExperiences,
  onNavigateToBookings,
  onLogout
}: VendorDashboardProps) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Use session.businessName directly, or fetch if needed
  const businessName = session.businessName

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const data = await vendorService.getVendorExperiences(session.vendorId)
        setExperiences(data)
      } catch (e) {
        console.error('Failed to load dashboard data', e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [session.vendorId])

  // Calculate stats
  const stats: VendorStats = {
    totalExperiences: experiences.length,
    totalBookingsThisMonth: 0, // Placeholder
    revenueThisMonth: 0, // Placeholder
    averageRating: experiences.length > 0
      ? experiences.reduce((sum, exp) => sum + exp.provider.rating, 0) / experiences.length
      : 0,
  }

  // Mock recent bookings for now
  const recentBookings = [] as any[]

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold">
                Welcome back, {businessName}!
              </h1>
              <p className="text-white/80 mt-1">
                Here's what's happening with your business
              </p>
            </div>
            <div className="flex items-center gap-4">
              {session.verified && (
                <div className="hidden sm:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <Star className="h-4 w-4 fill-white" />
                  <span className="text-sm font-medium">Verified Vendor</span>
                </div>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={onLogout}
                className="bg-white/20 hover:bg-white/30 text-white border-none"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Experiences</p>
                <p className="text-3xl font-bold mt-2">
                  {isLoading ? '...' : stats.totalExperiences}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bookings This Month</p>
                <p className="text-3xl font-bold mt-2">{stats.totalBookingsThisMonth}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +0%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue This Month</p>
                <p className="text-3xl font-bold mt-2">${stats.revenueThisMonth}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +0%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-3xl font-bold mt-2">
                  {isLoading ? '...' : stats.averageRating.toFixed(1)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < Math.floor(stats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-display font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={onNavigateToExperiences}
              className="h-auto py-6 flex-col gap-2"
            >
              <Plus className="h-6 w-6" />
              <span>Add New Experience</span>
            </Button>
            <Button
              onClick={onNavigateToBookings}
              variant="outline"
              className="h-auto py-6 flex-col gap-2"
            >
              <Calendar className="h-6 w-6" />
              <span>View All Bookings</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex-col gap-2"
            >
              <Eye className="h-6 w-6" />
              <span>Manage Calendar</span>
            </Button>
          </div>
        </Card>

        {/* Recent Bookings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold">Recent Bookings</h2>
            <Button variant="ghost" size="sm" onClick={onNavigateToBookings}>
              View all
            </Button>
          </div>

          {!recentBookings.length ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No bookings yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by creating your first experience
              </p>
              <Button onClick={onNavigateToExperiences}>
                <Plus className="mr-2 h-4 w-4" />
                Add Experience
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Map bookings if available */}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
