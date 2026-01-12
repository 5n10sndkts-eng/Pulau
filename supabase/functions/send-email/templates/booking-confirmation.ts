// ================================================
// Booking Confirmation Email Template
// Story: 30.2 - Build Email Template System
// AC #2: Booking Confirmation Template
// ================================================

import { wrapInBaseTemplate, components } from './base.ts'
import {
  escapeHtml,
  formatAmount,
  formatDate,
  generateMapsLink,
  getImageUrl,
  formatDuration,
  toHtmlList,
} from './utils.ts'

export interface BookingConfirmationData {
  booking_reference: string
  experience_name: string
  experience_description?: string
  experience_image?: string
  experience_date: string
  experience_time: string
  duration_minutes?: number
  guest_count: number
  total_amount: number
  currency: string
  traveler_name: string
  meeting_point?: string
  what_to_bring?: string[]
  inclusions?: string[]
  cancellation_policy?: string
  ticket_url?: string
}

/**
 * Generate the booking confirmation email HTML
 * Per AC #2, includes:
 * - Pulau logo and branding
 * - Booking reference (prominent)
 * - Experience name, image, and description
 * - Date, time, and duration
 * - Meeting point with map link
 * - Guest count and total paid
 * - What to bring / inclusions
 * - Cancellation policy summary
 * - Support contact
 */
export function generateBookingConfirmationEmail(data: BookingConfirmationData): string {
  const subject = `Booking Confirmed: ${data.experience_name}`

  // Build the meeting point section
  const meetingPointSection = data.meeting_point
    ? `
      ${components.card(`
        <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 16px;">
          Meeting Point
        </h3>
        <p style="margin: 0 0 16px; color: #666;">
          ${escapeHtml(data.meeting_point)}
        </p>
        ${components.secondaryButton(generateMapsLink(data.meeting_point), 'Open in Maps')}
      `)}
    `
    : ''

  // Build the what to bring section
  const whatToBringSection =
    data.what_to_bring && data.what_to_bring.length > 0
      ? `
      ${components.card(`
        <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 16px;">
          What to Bring
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #666;">
          ${toHtmlList(data.what_to_bring)}
        </ul>
      `)}
    `
      : ''

  // Build the inclusions section
  const inclusionsSection =
    data.inclusions && data.inclusions.length > 0
      ? `
      ${components.card(`
        <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 16px;">
          What's Included
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #666;">
          ${toHtmlList(data.inclusions)}
        </ul>
      `)}
    `
      : ''

  // Build the cancellation policy section
  const cancellationSection = data.cancellation_policy
    ? `
      <p style="margin: 24px 0 0; font-size: 13px; color: #888; border-top: 1px solid #eee; padding-top: 20px;">
        <strong style="color: #666;">Cancellation Policy:</strong><br>
        ${escapeHtml(data.cancellation_policy)}
      </p>
    `
    : ''

  // Build the CTA button
  const ctaButton = data.ticket_url
    ? components.button(data.ticket_url, 'View My Ticket')
    : ''

  // Format duration if provided
  const durationText = data.duration_minutes ? formatDuration(data.duration_minutes) : null

  // Build details rows
  const detailRows = `
    ${components.detailRow('Date', `<strong>${escapeHtml(formatDate(data.experience_date))}</strong>`)}
    ${components.detailRow('Time', `<strong>${escapeHtml(data.experience_time)}</strong>`)}
    ${durationText ? components.detailRow('Duration', durationText) : ''}
    ${components.detailRow('Guests', `${data.guest_count} ${data.guest_count === 1 ? 'guest' : 'guests'}`)}
    ${components.detailRow(
      'Total Paid',
      `<strong style="font-size: 18px; color: #0D7377;">${escapeHtml(data.currency)} ${formatAmount(data.total_amount)}</strong>`,
      true
    )}
  `

  const content = `
    <!-- Greeting -->
    <h1 style="margin: 0 0 8px; color: #0D7377; font-size: 28px; font-weight: 700;">
      Booking Confirmed!
    </h1>
    <p style="margin: 0 0 24px; color: #666; font-size: 16px;">
      Hi ${escapeHtml(data.traveler_name)}, you're all set.
    </p>

    <!-- Booking Reference (prominent per AC #2) -->
    ${components.highlight(`
      <strong style="font-size: 18px; color: #0D7377;">
        Reference: ${escapeHtml(data.booking_reference)}
      </strong>
    `)}

    <!-- Experience Card -->
    ${components.card(`
      <!-- Experience Image -->
      ${components.image(getImageUrl(data.experience_image), data.experience_name)}

      <!-- Experience Details -->
      <h2 style="margin: 20px 0 8px; color: #1a1a1a; font-size: 20px;">
        ${escapeHtml(data.experience_name)}
      </h2>
      ${
        data.experience_description
          ? `<p style="margin: 0; color: #666; font-size: 14px;">${escapeHtml(data.experience_description)}</p>`
          : ''
      }
    `)}

    <!-- Booking Details Table -->
    ${components.detailsTable(detailRows)}

    <!-- Meeting Point -->
    ${meetingPointSection}

    <!-- What to Bring -->
    ${whatToBringSection}

    <!-- Inclusions -->
    ${inclusionsSection}

    <!-- Cancellation Policy -->
    ${cancellationSection}

    <!-- CTA Button -->
    <div style="text-align: center; margin-top: 32px;">
      ${ctaButton}
    </div>

    <!-- Support info -->
    <p style="margin: 32px 0 0; text-align: center; color: #888; font-size: 13px;">
      Need to make changes? Contact us at
      <a href="mailto:support@pulau.app" style="color: #0D7377;">support@pulau.app</a>
    </p>
  `

  return wrapInBaseTemplate(content, subject)
}
