import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'

interface AboutScreenProps {
  onBack: () => void
}

export function AboutScreen({ onBack }: AboutScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="font-display text-2xl font-semibold">About Pulau</h1>
        </div>
      </div>

      <div className="container max-w-3xl space-y-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Pulau connects travelers with authentic local experiences in the world's most beautiful destinations.
              We partner with local operators to bring you curated adventures that go beyond typical tourism.
            </p>
            <p className="text-muted-foreground">
              Our platform makes it easy to discover, plan, and book unforgettable experiences while supporting
              local communities and sustainable tourism.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Version Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build</span>
                <span className="font-medium">2024.01.001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">January 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-between">
              Website
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full justify-between">
              Blog
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full justify-between">
              Careers
              <ExternalLink className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface TermsOfServiceScreenProps {
  onBack: () => void
}

export function TermsOfServiceScreen({ onBack }: TermsOfServiceScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="font-display text-2xl font-semibold">Terms of Service</h1>
        </div>
      </div>

      <div className="container max-w-3xl space-y-6 py-6">
        <p className="text-sm text-muted-foreground">Last updated: January 2024</p>

        <div className="prose prose-sm max-w-none dark:prose-invert">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Pulau, you accept and agree to be bound by the terms and provision of this agreement.
            If you do not agree to these terms, you should not use this service.
          </p>

          <h2>2. Use of Service</h2>
          <p>
            You agree to use the service only for lawful purposes and in accordance with these Terms. You agree not to use the service:
          </p>
          <ul>
            <li>In any way that violates any applicable national or international law or regulation</li>
            <li>To transmit any unsolicited or unauthorized advertising or promotional material</li>
            <li>To impersonate or attempt to impersonate the Company, another user, or any other person or entity</li>
          </ul>

          <h2>3. Bookings and Payments</h2>
          <p>
            All bookings are subject to availability and confirmation. Prices are subject to change without notice.
            Payment is required at the time of booking. Cancellation policies vary by experience.
          </p>

          <h2>4. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept
            responsibility for all activities that occur under your account.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            Pulau shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting
            from your use of or inability to use the service.
          </p>

          <h2>6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any material changes.
            Your continued use of the service after such modifications constitutes acceptance of the updated terms.
          </p>
        </div>
      </div>
    </div>
  )
}

interface PrivacyPolicyScreenProps {
  onBack: () => void
}

export function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="font-display text-2xl font-semibold">Privacy Policy</h1>
        </div>
      </div>

      <div className="container max-w-3xl space-y-6 py-6">
        <p className="text-sm text-muted-foreground">Last updated: January 2024</p>

        <div className="prose prose-sm max-w-none dark:prose-invert">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul>
            <li>Name, email address, phone number</li>
            <li>Payment information (processed securely through third-party providers)</li>
            <li>Booking and travel preferences</li>
            <li>Communications with vendors and support</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process your bookings and payments</li>
            <li>Send you confirmations and updates about your trips</li>
            <li>Provide customer support</li>
            <li>Improve and personalize your experience</li>
            <li>Send promotional communications (with your consent)</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We share your information with vendors to fulfill your bookings and with service providers who assist us in
            operating our platform. We do not sell your personal information to third parties.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However, no method of
            transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and review your personal information</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2>6. Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your experience, analyze usage, and personalize content.
            You can control cookie settings through your browser.
          </p>

          <h2>7. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13. We do not knowingly collect personal information from children.
          </p>

          <h2>8. Changes to Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any material changes by posting
            the new policy on this page.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have questions about this privacy policy, please contact us at privacy@pulau.app.
          </p>
        </div>
      </div>
    </div>
  )
}
