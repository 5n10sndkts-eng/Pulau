/**
 * Email Testing Utilities
 *
 * Helper functions for E2E email tests
 */

import { type Page } from '@playwright/test';
import MailosaurClient from 'mailosaur';
import type { Message } from 'mailosaur/lib/models';
import { createClient } from '@supabase/supabase-js';

export interface EmailTestConfig {
  apiKey: string;
  serverId: string;
}

/**
 * Initialize Mailosaur client from environment variables
 */
export function createMailosaurClient(): MailosaurClient {
  const apiKey = process.env.MAILOSAUR_API_KEY;
  const serverId = process.env.MAILOSAUR_SERVER_ID;

  if (!apiKey || !serverId) {
    throw new Error('MAILOSAUR_API_KEY and MAILOSAUR_SERVER_ID must be set');
  }

  return new MailosaurClient(apiKey);
}

/**
 * Generate unique test email address
 */
export function generateTestEmail(prefix = 'test'): string {
  const serverId = process.env.MAILOSAUR_SERVER_ID;
  if (!serverId) {
    throw new Error('MAILOSAUR_SERVER_ID must be set');
  }

  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${timestamp}-${random}@${serverId}.mailosaur.net`;
}

/**
 * Wait for email to arrive in Mailosaur inbox
 */
export async function waitForEmail(
  mailosaur: MailosaurClient,
  email: string,
  options: {
    timeout?: number;
    subject?: string;
  } = {},
): Promise<Message> {
  const serverId = process.env.MAILOSAUR_SERVER_ID;
  if (!serverId) {
    throw new Error('MAILOSAUR_SERVER_ID must be set');
  }

  const { timeout = 60000, subject } = options;

  const criteria: any = { sentTo: email };
  if (subject) {
    criteria.subject = subject;
  }

  return await mailosaur.messages.get(serverId, criteria, { timeout });
}

/**
 * Get all emails sent to a specific address
 */
export async function getEmailsForAddress(
  mailosaur: MailosaurClient,
  email: string,
): Promise<Message[]> {
  const serverId = process.env.MAILOSAUR_SERVER_ID;
  if (!serverId) {
    throw new Error('MAILOSAUR_SERVER_ID must be set');
  }

  const messages = await mailosaur.messages.list(serverId);
  return messages.items.filter((m) => m.to?.some((t) => t.email === email));
}

/**
 * Delete all emails in Mailosaur server (cleanup)
 */
export async function deleteAllEmails(
  mailosaur: MailosaurClient,
): Promise<void> {
  const serverId = process.env.MAILOSAUR_SERVER_ID;
  if (!serverId) {
    throw new Error('MAILOSAUR_SERVER_ID must be set');
  }

  await mailosaur.messages.deleteAll(serverId);
}

/**
 * Fill Stripe test card in payment form
 * Uses Stripe test card numbers: https://stripe.com/docs/testing
 */
export async function fillStripeTestCard(
  page: Page,
  cardType: 'success' | 'decline' | 'insufficient_funds' = 'success',
): Promise<void> {
  const cardNumbers: Record<string, string> = {
    success: '4242424242424242', // Visa - succeeds
    decline: '4000000000000002', // Visa - generic decline
    insufficient_funds: '4000000000009995', // Visa - insufficient funds
  };

  const cardNumber = cardNumbers[cardType];

  // Wait for Stripe iframe to load
  const stripeFrame = page
    .frameLocator('iframe[name^="__privateStripeFrame"]')
    .first();

  await stripeFrame.locator('input[name="cardnumber"]').fill(cardNumber);
  await stripeFrame.locator('input[name="exp-date"]').fill('12/34');
  await stripeFrame.locator('input[name="cvc"]').fill('123');
  await stripeFrame.locator('input[name="postal"]').fill('12345');
}

/**
 * Complete full booking flow in UI
 */
export async function completeBookingFlow(
  page: Page,
  email: string,
  options: {
    fullName?: string;
    phone?: string;
    guestCount?: number;
    experienceId?: number;
  } = {},
): Promise<void> {
  const {
    fullName = 'Test User',
    phone = '+1234567890',
    guestCount = 1,
    experienceId,
  } = options;

  // Navigate to experience details or home
  if (experienceId) {
    await page.goto(`/experiences/${experienceId}`);
  } else {
    // Navigate home if no specific ID part of the path (or just click first experience)
    await page.goto('/');
    await page.click('.experience-card:first-child a');
  }

  // Wait for and click book now
  await page.click('button:has-text("Book Now")');

  // Fill checkout form
  await page.fill('input[name="fullName"]', fullName);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="phone"]', phone);

  if (guestCount > 1) {
    // Check if it's an input or a counter
    const guestInput = page.locator('input[name="guestCount"]');
    if (await guestInput.isVisible()) {
      await guestInput.fill(guestCount.toString());
    }
  }

  // Select date
  await page.click('button:has-text("Select Date")');
  await page.click('.calendar-day:not(.disabled):first-child');

  // Select time slot
  await page.click('.time-slot:not(.disabled):first-child');

  // Fill payment
  await fillStripeTestCard(page);

  // Submit
  await page.click('button:has-text("Complete Booking")');
}

/**
 * Extract booking reference from confirmation page
 */
export async function getBookingReference(page: Page): Promise<string> {
  const bookingRef = await page
    .locator('[data-testid="booking-reference"]')
    .textContent();
  if (!bookingRef) {
    throw new Error('Booking reference not found on page');
  }
  return bookingRef.trim();
}

/**
 * Validate email contains all required fields
 */
export function validateEmailContent(
  email: Message,
  requiredFields: string[],
): void {
  const htmlBody = email.html?.body?.toLowerCase() || '';
  const textBody = email.text?.body?.toLowerCase() || '';

  for (const field of requiredFields) {
    const fieldLower = field.toLowerCase();
    const found =
      htmlBody.includes(fieldLower) || textBody.includes(fieldLower);

    if (!found) {
      throw new Error(`Email missing required field: ${field}`);
    }
  }
}

/**
 * Check if email has PDF attachment
 */
export function hasTicketAttachment(email: Message): boolean {
  return (
    email.attachments?.some(
      (a) =>
        a.fileName?.toLowerCase().includes('ticket') ||
        a.contentType === 'application/pdf',
    ) || false
  );
}

/**
 * Find link in email by text or href pattern
 */
export function findEmailLink(
  email: Message,
  pattern: string | RegExp,
): { text: string; href: string } | undefined {
  const links = email.html?.links || [];

  return links.find((link) => {
    if (typeof pattern === 'string') {
      return link.text?.includes(pattern) || link.href?.includes(pattern);
    } else {
      return pattern.test(link.text || '') || pattern.test(link.href || '');
    }
  });
}

/**
 * Verify email rendering best practices
 */
export interface EmailRenderingChecks {
  hasViewportMeta: boolean;
  hasInlineStyles: boolean;
  maxWidth600: boolean;
  hasAltText: boolean;
  absoluteUrls: boolean;
  tableLayout: boolean;
}

export function checkEmailRendering(email: Message): EmailRenderingChecks {
  const html = email.html?.body || '';

  return {
    hasViewportMeta: html.includes('viewport'),
    hasInlineStyles: /style="[^"]+"/i.test(html),
    maxWidth600: /max-width:\s*600px/i.test(html),
    hasAltText: !/<img(?![^>]*alt=)/i.test(html), // No img without alt
    absoluteUrls: !/src=["']\/|href=["']\//i.test(html), // No relative URLs
    tableLayout: /<table/i.test(html),
  };
}

/**
 * Calculate email size in KB
 */
export function getEmailSize(email: Message): number {
  // Rough estimation based on string lengths
  const htmlSize = Buffer.from(email.html?.body || '').length;
  const textSize = Buffer.from(email.text?.body || '').length;
  const attachmentSize =
    email.attachments?.reduce((acc, a) => acc + (a.length || 0), 0) || 0;

  return (htmlSize + textSize + attachmentSize) / 1024; // KB
}

/**
 * Mock Resend API for testing
 */
export interface ResendMockConfig {
  failFirst?: boolean;
  alwaysFail?: boolean;
  delay?: number;
}

export async function mockResendAPI(
  page: Page,
  config: ResendMockConfig = {},
): Promise<void> {
  let alreadyFailed = false;

  await page.route('**/api.resend.com/emails', async (route) => {
    if (config.alwaysFail) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    } else if (config.failFirst && !alreadyFailed) {
      alreadyFailed = true;
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    } else {
      if (config.delay) await page.waitForTimeout(config.delay);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: `mock-${Date.now()}` }),
      });
    }
  });
}

/**
 * Query email_logs table for email delivery status
 */
export async function getEmailLogStatus(bookingId: string): Promise<any> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials missing for getEmailLogStatus');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('email_logs')
    .select('*')
    .eq('booking_id', bookingId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is 'no rows found'
    throw error;
  }

  return data;
}
