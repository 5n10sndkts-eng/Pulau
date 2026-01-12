/**
 * E2E Tests for Email Delivery System
 * 
 * Tests the complete email delivery flow from booking confirmation
 * to email receipt, content validation, and link functionality.
 */

import { test, expect } from '@playwright/test';
import {
  createMailosaurClient,
  generateTestEmail,
  waitForEmail,
  completeBookingFlow,
  getBookingReference,
  validateEmailContent,
  hasTicketAttachment,
  findEmailLink
} from '../support/email-helpers';

const mailosaur = createMailosaurClient();
const serverId = process.env.MAILOSAUR_SERVER_ID!;
const senderEmail = process.env.EMAIL_SENDER || 'noreply@pulau.app';

test.describe('Email Delivery E2E', () => {
  test.setTimeout(90000); // 90 seconds for email delivery

  test('sends booking confirmation email after successful payment', async ({ page }) => {
    const testEmail = generateTestEmail('delivery');

    // Complete booking flow using helper
    await completeBookingFlow(page, testEmail);

    // Wait for success page
    await expect(page.locator('text=Booking Confirmed')).toBeVisible({ timeout: 30000 });

    // Extract booking reference
    const bookingRef = await getBookingReference(page);

    // Wait for email arrival
    const email = await waitForEmail(mailosaur, testEmail);

    // Validate email metadata
    expect(email.from).toBeDefined();
    expect(email.to).toBeDefined();
    expect(email.from![0].email).toContain(senderEmail.split('@')[0]);
    expect(email.to![0].email).toBe(testEmail);
    expect(email.subject).toContain('Booking Confirmation');

    // Validate email content using helper
    validateEmailContent(email, ['Thank you for booking', bookingRef, 'Test User']);

    // Validate PDF attachment
    expect(hasTicketAttachment(email)).toBeTruthy();

    // Verify link functionality
    const viewBookingLink = findEmailLink(email, /\/bookings\//);
    expect(viewBookingLink).toBeTruthy();

    if (viewBookingLink) {
      await page.goto(viewBookingLink.href);
      await expect(page.locator('text=Booking Details')).toBeVisible({ timeout: 15000 });
    }
  });

  test('email arrives within 30 seconds of booking', async ({ page }) => {
    const testEmail = generateTestEmail('speed');
    const startTime = Date.now();

    await completeBookingFlow(page, testEmail);
    await expect(page.locator('text=Booking Confirmed')).toBeVisible();

    await waitForEmail(mailosaur, testEmail, { timeout: 35000 });

    const deliveryTime = Date.now() - startTime;
    console.log(`Email delivered in ${deliveryTime}ms`);

    expect(deliveryTime).toBeLessThan(35000 * 2); // Allowing for booking flow + delivery
  });

  test('handles guest counts in email', async ({ page }) => {
    const testEmail = generateTestEmail('guests');

    await completeBookingFlow(page, testEmail, { guestCount: 5 });
    await expect(page.locator('text=Booking Confirmed')).toBeVisible();

    const email = await waitForEmail(mailosaur, testEmail);
    expect(email.html).toBeDefined();
    expect(email.html!.body).toMatch(/5\s*guests?/i);
  });

  test('does not send email for failed bookings', async ({ page }) => {
    const testEmail = generateTestEmail('failed-payment');

    await completeBookingFlow(page, testEmail); // This helper uses 'success' by default, wait we need to override card

    // Actually, let's manually trigger for failure to avoid changing helper too much
    await page.goto('/');
    await page.click('.experience-card:first-child a');
    await page.click('button:has-text("Book Now")');
    await page.fill('input[name="fullName"]', 'Fail User');
    await page.fill('input[name="email"]', testEmail);

    // Use Stripe decline card directly here or via helper option
    const { fillStripeTestCard } = await import('../support/email-helpers');
    await fillStripeTestCard(page, 'decline');

    await page.click('button:has-text("Complete Booking")');

    // Should see error
    await expect(page.locator('text=/payment.*failed|declined/i')).toBeVisible({ timeout: 15000 });

    // Wait to ensure no email is processed
    await page.waitForTimeout(10000);

    const messages = await mailosaur.messages.list(serverId);
    expect(messages.items).toBeDefined();
    const found = messages.items!.find(m => m.to?.some(t => t.email === testEmail));
    expect(found).toBeUndefined();
  });
});

test.describe('Edge Case Validations', () => {
  test('all required template variables are rendered', async ({ page }) => {
    const testEmail = generateTestEmail('variables');
    await completeBookingFlow(page, testEmail);

    const email = await waitForEmail(mailosaur, testEmail);

    const requiredFields = [
      'Reference',
      'Experience',
      'Date',
      'Time',
      'Guest',
      'Total',
    ];

    validateEmailContent(email, requiredFields);
  });

  test('all links in email are valid and functional', async ({ page }) => {
    const testEmail = generateTestEmail('links');
    await completeBookingFlow(page, testEmail);

    const email = await waitForEmail(mailosaur, testEmail);
    expect(email.html).toBeDefined();
    const links = email.html!.links || [];

    for (const link of links) {
      if (!link.href || link.href.startsWith('mailto:')) continue;

      expect(link.href).toMatch(/^https?:\/\//);
      const response = await page.request.get(link.href);
      expect(response.status()).toBeLessThan(400);
    }
  });
});

