import { useState } from 'react'
import { MessageSquare, Mail, Phone, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { toast } from 'sonner'

interface HelpAndSupportScreenProps {
  onBack: () => void
}

const faqs = [
  {
    question: 'How do I book an experience?',
    answer: 'Browse experiences, add them to your trip, then proceed to checkout. You can add multiple experiences and book them all together.'
  },
  {
    question: 'What is the cancellation policy?',
    answer: 'Cancellation policies vary by experience. Check the "Cancellation Policy" section on each experience page for specific details.'
  },
  {
    question: 'How do I contact a vendor?',
    answer: 'After booking, you can message vendors directly through the Messages tab. Before booking, use the "Ask a Question" button on the experience page.'
  },
  {
    question: 'Can I modify my booking?',
    answer: 'Visit "My Trips" in your profile, select the booking, and choose "Modify Booking" to change dates or guest count (subject to availability).'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept major credit cards (Visa, Mastercard, Amex), debit cards, and PayPal. All payments are processed securely.'
  },
  {
    question: 'How do I get a refund?',
    answer: 'Refund eligibility depends on the cancellation policy. Cancel your booking through "My Trips" and eligible refunds are processed within 5-7 business days.'
  },
]

export function HelpAndSupportScreen({ onBack }: HelpAndSupportScreenProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    toast.success('Support request submitted. We\'ll get back to you soon!')
    setSubject('')
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="font-display text-2xl font-semibold">Help & Support</h1>
        </div>
      </div>

      <div className="container max-w-3xl space-y-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>Get in touch with our support team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="mr-2 h-5 w-5" />
              Live Chat
              <ChevronRight className="ml-auto h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Mail className="mr-2 h-5 w-5" />
              Email: support@pulau.app
              <ChevronRight className="ml-auto h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Phone className="mr-2 h-5 w-5" />
              Call: +1 (555) 123-4567
              <ChevronRight className="ml-auto h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
            <CardDescription>Can't find what you're looking for? Send us a message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={6}
              />
            </div>
            <Button onClick={handleSubmit} className="w-full">
              Submit Request
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
