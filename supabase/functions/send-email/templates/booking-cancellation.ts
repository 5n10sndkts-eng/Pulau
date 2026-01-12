// ================================================
// Booking Cancellation Email Template
// Story: 30.2 - Build Email Template System
// AC #1: Branded Email Templates
// ================================================

import { wrapInBaseTemplate, components } from './base.ts'
import { escapeHtml, formatAmount, formatDateShort } from './utils.ts'

export interface BookingCancellationData {
  booking_reference: string
  experience_name: string
  experience_date: string
  guest_count: number
  total_amount: number
  currency: string
  traveler_name: string
  refund_amount?: number
  refund_status?: 'pending' | 'processing' | 'completed' | 'none'
  cancellation_reason?: string
}

/**
 * Generate the booking cancellation email HTML
 * Informs traveler that their booking has been cancelled
 * and provides refund information if applicable
 */
export function generateBookingCancellationEmail(data: BookingCancellationData): string {
  const subject = `Booking Cancelled: ${data.experience_name}`

  // Build refund section based on status
  let refundSection = ''

  if (data.refund_status && data.refund_status !== 'none') {
    const refundAmount = data.refund_amount ?? data.total_amount

    const refundStatusText = {
      pending: 'Your refund is being processed.',
      processing: 'Your refund is on its way.',
      completed: 'Your refund has been processed.',
    }[data.refund_status]

    refundSection = `
      ${components.card(`
        <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 16px;">
          Refund Information
        </h3>
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
          ${components.detailRow('Refund Amount', `<strong style="color: #27AE60;">${escapeHtml(data.currency)} ${formatAmount(refundAmount)}</strong>`)}
          ${components.detailRow('Status', `<span style="color: #0D7377;">${refundStatusText}</span>`, true)}
        </table>
        <p style="margin: 16px 0 0; font-size: 13px; color: #888;">
          Refunds typically appear in your account within 5-10 business days, depending on your payment provider.
        </p>
      `)}
    `
  }

  // Cancellation reason if provided
  const reasonSection = data.cancellation_reason
    ? `
      <p style="margin: 20px 0 0; color: #666; font-size: 14px;">
        <strong>Reason:</strong> ${escapeHtml(data.cancellation_reason)}
      </p>
    `
    : ''

  const content = `
    <!-- Header -->
    <h1 style="margin: 0 0 8px; color: #666; font-size: 28px; font-weight: 700;">
      Booking Cancelled
    </h1>
    <p style="margin: 0 0 24px; color: #888; font-size: 16px;">
      Hi ${escapeHtml(data.traveler_name)}, we're sorry to see you go.
    </p>

    <!-- Cancellation Details -->
    ${components.card(`
      <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 18px;">
        ${escapeHtml(data.experience_name)}
      </h3>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        ${components.detailRow('Reference', `<strong>${escapeHtml(data.booking_reference)}</strong>`)}
        ${components.detailRow('Original Date', formatDateShort(data.experience_date))}
        ${components.detailRow('Guests', `${data.guest_count} ${data.guest_count === 1 ? 'guest' : 'guests'}`, true)}
      </table>
      ${reasonSection}
    `)}

    <!-- Refund Section -->
    ${refundSection}

    ${components.divider()}

    <!-- Rebook CTA -->
    <div style="text-align: center; margin-top: 24px;">
      <p style="margin: 0 0 16px; color: #666; font-size: 14px;">
        Changed your mind? You can always book again.
      </p>
      ${components.button('https://pulau.app/experiences', 'Browse Experiences')}
    </div>

    <!-- Support info -->
    <p style="margin: 32px 0 0; text-align: center; color: #888; font-size: 13px;">
      Have questions about your cancellation?<br>
      Contact us at <a href="mailto:support@pulau.app" style="color: #0D7377;">support@pulau.app</a>
    </p>
  `

  return wrapInBaseTemplate(content, subject)
}
