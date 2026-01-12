// ================================================
// Booking Reminder Email Template
// Story: 30.2 - Build Email Template System
// AC #1: Branded Email Templates
// ================================================

import { wrapInBaseTemplate, components } from './base.ts'
import {
  escapeHtml,
  formatDate,
  generateMapsLink,
  getImageUrl,
  toHtmlList,
} from './utils.ts'

export interface BookingReminderData {
  booking_reference: string
  experience_name: string
  experience_image?: string
  experience_date: string
  experience_time: string
  guest_count: number
  traveler_name: string
  meeting_point?: string
  what_to_bring?: string[]
  weather_note?: string
  ticket_url?: string
  reminder_type?: '24h' | '2h' | 'morning'
}

/**
 * Generate the booking reminder email HTML
 * Sent before the experience to ensure traveler is prepared
 */
export function generateBookingReminderEmail(data: BookingReminderData): string {
  // Determine urgency messaging based on reminder type
  const reminderType = data.reminder_type ?? '24h'
  const urgencyText = {
    '24h': 'is tomorrow',
    '2h': 'starts in 2 hours',
    morning: 'is today',
  }[reminderType]

  const subject = `Reminder: ${data.experience_name} ${urgencyText}!`

  // Meeting point section with map link
  const meetingPointSection = data.meeting_point
    ? `
      ${components.highlight(`
        <h3 style="margin: 0 0 8px; color: #0D7377; font-size: 16px;">
          Meeting Point
        </h3>
        <p style="margin: 0 0 12px; color: #1a1a1a; font-weight: 500;">
          ${escapeHtml(data.meeting_point)}
        </p>
        <a href="${generateMapsLink(data.meeting_point)}" style="display: inline-block; color: #0D7377; font-weight: 600; font-size: 14px;">
          Open in Google Maps &rarr;
        </a>
      `)}
    `
    : ''

  // What to bring checklist
  const whatToBringSection =
    data.what_to_bring && data.what_to_bring.length > 0
      ? `
      ${components.card(`
        <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 16px;">
          Don't Forget to Bring
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #666;">
          ${toHtmlList(data.what_to_bring)}
        </ul>
      `)}
    `
      : ''

  // Weather note if provided
  const weatherSection = data.weather_note
    ? `
      ${components.warning(`
        <p style="margin: 0; font-size: 14px;">
          <strong style="color: #FF6B6B;">Weather Note:</strong><br>
          ${escapeHtml(data.weather_note)}
        </p>
      `)}
    `
    : ''

  // CTA button
  const ctaButton = data.ticket_url
    ? components.button(data.ticket_url, 'View My Ticket')
    : ''

  const content = `
    <!-- Excitement Header -->
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="margin: 0 0 8px; color: #FF6B6B; font-size: 28px; font-weight: 700;">
        Get Ready!
      </h1>
      <p style="margin: 0; color: #666; font-size: 16px;">
        Hi ${escapeHtml(data.traveler_name)}, your experience ${urgencyText}!
      </p>
    </div>

    <!-- Experience Preview -->
    ${components.card(`
      ${components.image(getImageUrl(data.experience_image), data.experience_name, '180')}
      <h2 style="margin: 16px 0 8px; color: #1a1a1a; font-size: 20px; text-align: center;">
        ${escapeHtml(data.experience_name)}
      </h2>
    `)}

    <!-- Key Details (prominent) -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0; background-color: #f9f9f9; border-radius: 12px; overflow: hidden;">
      <tr>
        <td style="padding: 20px; text-align: center; border-right: 1px solid #eee; width: 50%;">
          <p style="margin: 0 0 4px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            Date
          </p>
          <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
            ${escapeHtml(formatDate(data.experience_date))}
          </p>
        </td>
        <td style="padding: 20px; text-align: center; width: 50%;">
          <p style="margin: 0 0 4px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            Time
          </p>
          <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
            ${escapeHtml(data.experience_time)}
          </p>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 16px 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            Reference
          </p>
          <p style="margin: 4px 0 0; color: #0D7377; font-size: 18px; font-weight: 700;">
            ${escapeHtml(data.booking_reference)}
          </p>
        </td>
      </tr>
    </table>

    <!-- Meeting Point (critical info) -->
    ${meetingPointSection}

    <!-- What to Bring -->
    ${whatToBringSection}

    <!-- Weather Note -->
    ${weatherSection}

    <!-- Ticket CTA -->
    <div style="text-align: center; margin-top: 32px;">
      ${ctaButton}
    </div>

    <!-- Helpful Tips -->
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
      <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
        Quick Tips
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
        <li>Arrive 10-15 minutes early to check in</li>
        <li>Have your ticket QR code ready (works offline!)</li>
        <li>Stay hydrated and wear comfortable shoes</li>
      </ul>
    </div>

    <!-- Support -->
    <p style="margin: 32px 0 0; text-align: center; color: #888; font-size: 13px;">
      Need help? Contact us at <a href="mailto:support@pulau.app" style="color: #0D7377;">support@pulau.app</a>
    </p>
  `

  return wrapInBaseTemplate(content, subject)
}
