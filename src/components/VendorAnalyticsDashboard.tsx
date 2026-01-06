import { TrendingUp, DollarSign, Users, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface VendorAnalyticsDashboardProps {
  onBack: () => void
}

const mockStats = {
  totalRevenue: 45280,
  totalBookings: 156,
  totalViews: 3421,
  conversionRate: 4.6,
}

const mockExperiencePerformance = [
  { id: 1, name: 'Sunrise Yoga at Tanah Lot', bookings: 45, revenue: 11250, views: 892, conversion: 5.0 },
  { id: 2, name: 'Bali Cooking Class', bookings: 38, revenue: 9500, views: 654, conversion: 5.8 },
  { id: 3, name: 'Mount Batur Sunrise Trek', bookings: 42, revenue: 16800, views: 1105, conversion: 3.8 },
  { id: 4, name: 'Ubud Rice Terrace Tour', bookings: 31, revenue: 7730, views: 770, conversion: 4.0 },
]

export function VendorAnalyticsDashboard({ onBack }: VendorAnalyticsDashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="font-display text-2xl font-semibold">Analytics Dashboard</h1>
        </div>
      </div>

      <div className="container space-y-6 py-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${mockStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="mr-1 inline h-3 w-3 text-green-500" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="mr-1 inline h-3 w-3 text-green-500" />
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +24.3% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                +0.8% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Chart</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end justify-between gap-4 px-4">
              {[32000, 38000, 35000, 42000, 39000, 45280].map((value, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary rounded-t-md transition-all hover:opacity-80"
                    style={{ height: `${(value / 50000) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience Performance</CardTitle>
            <CardDescription>Your top performing experiences</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Experience</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Conversion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockExperiencePerformance.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">{exp.name}</TableCell>
                    <TableCell className="text-right">{exp.bookings}</TableCell>
                    <TableCell className="text-right">${exp.revenue.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{exp.views}</TableCell>
                    <TableCell className="text-right">{exp.conversion}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>How visitors progress through your funnel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { stage: 'Views', count: 3421, percentage: 100 },
              { stage: 'Detail Page Visits', count: 892, percentage: 26 },
              { stage: 'Add to Trip', count: 267, percentage: 7.8 },
              { stage: 'Checkout Started', count: 189, percentage: 5.5 },
              { stage: 'Completed Booking', count: 156, percentage: 4.6 },
            ].map((stage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-muted-foreground">
                    {stage.count} ({stage.percentage}%)
                  </span>
                </div>
                <div className="h-8 bg-muted rounded-md overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
