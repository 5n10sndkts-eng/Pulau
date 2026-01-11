import { useState, useEffect } from 'react'
import { VendorSession, VendorStats, Experience } from '@/lib/types'
import { vendorService } from '@/lib/vendorService'
import {
  vendorOnboardService,
  VendorPaymentStatus,
  VerificationStep,
  formatPayoutSchedule,
  STATE_LABELS,
} from '@/lib/vendorOnboardService'
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
  Eye,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Clock,
  Circle,
  Zap,
  Banknote
} from 'lucide-react'
import { useVendorNotifications } from '@/hooks/useVendorNotifications'
import { VendorNotificationBell } from './VendorNotificationBell'

interface VendorDashboardProps {
  session: VendorSession
  onNavigateToExperiences: () => void
  onNavigateToBookings: () => void
  onNavigateToRevenue?: () => void
  onLogout: () => void
}

export function VendorDashboard({
  session,
  onNavigateToExperiences,
  onNavigateToBookings,
  onNavigateToRevenue,
  onLogout
}: VendorDashboardProps) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<VendorPaymentStatus | null>(null)
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false)
  const [onboardingError, setOnboardingError] = useState<string | null>(null)

  // Use session.businessName directly, or fetch if needed
  const businessName = session.businessName

  // Real-time notifications hook
  const notifications = useVendorNotifications({
    vendorId: session.vendorId,
    enabled: true,
    simulateForDemo: import.meta.env.DEV, // Enable simulation in dev mode
  })

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      try {
        const [experiencesData, paymentData] = await Promise.all([
          vendorService.getVendorExperiences(session.vendorId),
          vendorOnboardService.getVendorPaymentStatus(session.vendorId)
        ])
        setExperiences(experiencesData)
        setPaymentStatus(paymentData)
      } catch (e) {
        console.error('Failed to load dashboard data', e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [session.vendorId])

  const handleSetupPayments = async () => {
    setIsOnboardingLoading(true)
    setOnboardingError(null)
    try {
      const result = await vendorOnboardService.initiateStripeOnboarding()
      if (result.success && result.accountLinkUrl) {
        // Redirect to Stripe onboarding
        window.location.href = result.accountLinkUrl
      } else {
        setOnboardingError(result.error || 'Failed to start payment setup')
      }
    } catch (e) {
      setOnboardingError('An unexpected error occurred')
    } finally {
      setIsOnboardingLoading(false)
    }
  }

  const handleOpenStripeDashboard = async () => {
    const result = await vendorOnboardService.getStripeExpressDashboardLink()
    if (result.success && result.dashboardUrl) {
      window.open(result.dashboardUrl, '_blank')
    }
  }

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
              <VendorNotificationBell
                notifications={notifications.notifications}
                unreadCount={notifications.unreadCount}
                permissionStatus={notifications.permissionStatus}
                preferences={notifications.preferences}
                onRequestPermission={notifications.requestPermission}
                onUpdatePreferences={notifications.updatePreferences}
                onMarkAsRead={notifications.markAsRead}
                onMarkAllAsRead={notifications.markAllAsRead}
                onClearAll={notifications.clearAll}
                onSimulateBooking={import.meta.env.DEV ? notifications.simulateBooking : undefined}
                className="text-white hover:bg-white/20"
              />
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

          <Card
            className={`p-6 ${onNavigateToRevenue ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
            onClick={onNavigateToRevenue}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue This Month</p>
                <p className="text-3xl font-bold mt-2">${stats.revenueThisMonth}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {onNavigateToRevenue ? 'View Details →' : '+0%'}
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

        {/* Payment Setup Card - Not Started or In Progress */}
        {paymentStatus && paymentStatus.onboardingState !== 'active' && (
          <Card className="p-6 border-2 border-dashed border-primary/30 bg-primary/5">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {paymentStatus.onboardingState === 'pending_verification' ? (
                  <Clock className="h-6 w-6 text-primary" />
                ) : (
                  <CreditCard className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-display font-bold mb-1">
                  {paymentStatus.onboardingState === 'not_started' && 'Set Up Payments'}
                  {paymentStatus.onboardingState === 'in_progress' && 'Complete Payment Setup'}
                  {paymentStatus.onboardingState === 'pending_verification' && 'Verification in Progress'}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {paymentStatus.onboardingState === 'not_started' &&
                    'Connect your bank account to receive payments when travelers book your experiences.'}
                  {paymentStatus.onboardingState === 'in_progress' &&
                    'Continue setting up your payment account to start receiving payments for bookings.'}
                  {paymentStatus.onboardingState === 'pending_verification' &&
                    'We\'re reviewing your information. This usually takes 1-2 business days.'}
                </p>

                {/* Verification Steps Progress */}
                <div className="space-y-3 mb-4">
                  {paymentStatus.verificationSteps.map((step: VerificationStep) => (
                    <div key={step.id} className="flex items-center gap-3">
                      {step.status === 'complete' && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                      {step.status === 'in_progress' && (
                        <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
                      )}
                      {step.status === 'pending' && (
                        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      {step.status === 'failed' && (
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          step.status === 'complete' ? 'text-green-700' :
                          step.status === 'in_progress' ? 'text-primary' :
                          step.status === 'failed' ? 'text-destructive' :
                          'text-muted-foreground'
                        }`}>
                          {step.label}
                        </p>
                        {step.description && (
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {onboardingError && (
                  <div className="flex items-center gap-2 text-sm text-destructive mb-4">
                    <AlertCircle className="h-4 w-4" />
                    {onboardingError}
                  </div>
                )}

                {paymentStatus.onboardingState !== 'pending_verification' && (
                  <Button
                    onClick={handleSetupPayments}
                    disabled={isOnboardingLoading}
                    className="gap-2"
                  >
                    {isOnboardingLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        {paymentStatus.hasStripeAccount ? 'Continue Setup' : 'Set Up Payments'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Payments Active Card */}
        {paymentStatus?.onboardingState === 'active' && (
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex flex-col gap-4">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-green-800">
                      Payments Active
                    </h2>
                    <p className="text-sm text-green-700">
                      You can receive payments for your experiences
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenStripeDashboard}
                  className="gap-2 border-green-300 text-green-700 hover:bg-green-100 w-full sm:w-auto"
                >
                  <ExternalLink className="h-4 w-4" />
                  Stripe Dashboard
                </Button>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap gap-3 pt-2 border-t border-green-200">
                {/* Instant Book Status */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  paymentStatus.instantBookEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <Zap className={`h-4 w-4 ${
                    paymentStatus.instantBookEnabled ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <span>
                    {paymentStatus.instantBookEnabled ? 'Instant Book Enabled' : 'Instant Book Available'}
                  </span>
                </div>

                {/* Payout Schedule */}
                {paymentStatus.payoutSchedule && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm">
                    <Banknote className="h-4 w-4 text-green-600" />
                    <span>Payouts: {formatPayoutSchedule(paymentStatus.payoutSchedule)}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Vendor State Badge - Shows current onboarding state */}
        {paymentStatus && (
          <Card className="p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Account Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  paymentStatus.vendorState === 'active' ? 'bg-green-100 text-green-800' :
                  paymentStatus.vendorState === 'suspended' ? 'bg-red-100 text-red-800' :
                  paymentStatus.vendorState === 'kyc_rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {STATE_LABELS[paymentStatus.vendorState]}
                </span>
              </div>
              {paymentStatus.capabilities && (
                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                  {paymentStatus.capabilities.canReceivePayments && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      Payments Active
                    </span>
                  )}
                  {paymentStatus.capabilities.canEnableInstantBook && !paymentStatus.capabilities.canReceivePayments && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-yellow-600" />
                      Instant Book Eligible
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-display font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={onNavigateToExperiences}
              className="h-auto py-6 flex-col gap-2"
              disabled={!paymentStatus?.capabilities?.canCreateExperiences}
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
              disabled={!paymentStatus?.capabilities?.canViewAnalytics}
            >
              <Eye className="h-6 w-6" />
              <span>Manage Calendar</span>
            </Button>
          </div>
          {paymentStatus?.vendorState === 'suspended' && (
            <p className="text-sm text-destructive mt-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Your account is suspended. Please contact support to resolve this issue.
            </p>
          )}
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
