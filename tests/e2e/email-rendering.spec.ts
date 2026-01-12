/**
 * Email Rendering Tests
 * 
 * Validates that emails render correctly across different email clients
 * and devices (Gmail, Outlook, Apple Mail, dark mode, mobile, etc.)
 */

import { test, expect } from '@playwright/test';
import { createMailosaurClient, generateTestEmail, waitForEmail, checkEmailRendering, completeBookingFlow } from '../support/email-helpers';
import dns from 'dns/promises';

const mailosaur = createMailosaurClient();

test.describe('Email Rendering Validation', () => {
  let testEmail: string;
  let emailHtml: string;

  test.beforeAll(async ({ browser }) => {
    testEmail = generateTestEmail('rendering');
    const page = await browser.newPage();

    // Trigger real email
    await completeBookingFlow(page, testEmail);

    // Wait for email
    const email = await waitForEmail(mailosaur, testEmail);
    emailHtml = email.html?.body || '';
    await page.close();
  });

  test('validates HTML structure for email clients', async () => {
    const requiredStructure = [
      /<html/i,
      /<head/i,
      /<body/i,
      /<table/i, // Email clients prefer table layouts
      /<\/table>/i,
      /<\/body>/i,
      /<\/html>/i,
    ];

    for (const regex of requiredStructure) {
      expect(emailHtml).toMatch(regex);
    }
  });

  test('contains viewport meta tag for mobile', async () => {
    expect(emailHtml).toMatch(/<meta[^>]+name=["']viewport["'][^>]+content=["'][^"']*width=device-width[^"']*["']/i);
  });

  test('uses inline CSS for critical styles', async () => {
    // Check for inline style attributes which are more reliable than <style> blocks
    expect(emailHtml).toMatch(/style=["'][^"']*display:\s*block[^"']*["']/i);
    expect(emailHtml).toMatch(/style=["'][^"']*padding:[^"']*["']/i);
  });

  test('has fallback fonts for cross-platform compatibility', async () => {
    expect(emailHtml).toMatch(/font-family:[^;]*sans-serif/i);
    expect(emailHtml).toMatch(/font-family:[^;]*Arial/i);
  });

  test('uses absolute URLs for all images and links', async () => {
    // Should not contain relative paths starting with /
    const relativeSrc = emailHtml.match(/src=["']\/(?!\/)/g);
    const relativeHref = emailHtml.match(/href=["']\/(?!\/)/g);

    expect(relativeSrc).toBeNull();
    expect(relativeHref).toBeNull();
  });

  test('includes alt text for images', async () => {
    // Find all images and ensure they have alt attribute
    const images = emailHtml.match(/<img[^>]*>/g) || [];
    for (const img of images) {
      expect(img).toMatch(/alt=["'][^"']*["']/i);
    }
  });

  test('has dark mode support markers', async () => {
    expect(emailHtml).toMatch(/@media\s*\(prefers-color-scheme:\s*dark\)/i);
  });

  test('table widths are optimized (e.g. max-width 600px)', async () => {
    expect(emailHtml).toMatch(/max-width:\s*600px/i);
  });
});

test.describe('DNS & SPF/DKIM Validation', () => {
  const domain = 'pulau.app';

  test('SPF record configured correctly', async () => {
    const records = await dns.resolveTxt(domain);
    const spfRecord = records.flat().find(r => r.includes('v=spf1'));

    expect(spfRecord).toBeTruthy();
    expect(spfRecord).toContain('include:sendgrid.net'); // Resend uses SendGrid
  });

  test('DMARC policy configured', async () => {
    const records = await dns.resolveTxt(`_dmarc.${domain}`);
    const dmarcRecord = records.flat().find(r => r.includes('v=DMARC1'));

    expect(dmarcRecord).toBeTruthy();
    expect(dmarcRecord).toMatch(/p=(quarantine|reject|none)/);
  });

  test('DKIM record exists', async () => {
    // Usually resend._domainkey
    const records = await dns.resolveTxt(`resend._domainkey.${domain}`);
    expect(records.length).toBeGreaterThan(0);
  });
});

test.describe('Compliance & Anti-Spam', () => {
  let emailHtml: string;

  test.beforeAll(async () => {
    const testEmail = generateTestEmail('compliance');
    const email = await waitForEmail(mailosaur, testEmail);
    emailHtml = email.html?.body || '';
  });

  test('physical address present in footer (CAN-SPAM)', async () => {
    // Should contain a zip code-like pattern or common address keywords
    expect(emailHtml).toMatch(/\d{5}|Bali|Indonesia|Street|Avenue/i);
  });

  test('no spam trigger words in subject line', async () => {
    const testEmail = generateTestEmail('subject-test');
    const email = await waitForEmail(mailosaur, testEmail);
    const subject = email.subject || '';

    const spamWords = ['FREE', '$$$', 'ACT NOW', 'URGENT', 'CONGRATULATIONS'];
    for (const word of spamWords) {
      expect(subject.toUpperCase()).not.toContain(word);
    }
  });
});

test.describe('Accessibility', () => {
  let emailHtml: string;

  test.beforeAll(async () => {
    const testEmail = generateTestEmail('a11y');
    const email = await waitForEmail(mailosaur, testEmail);
    emailHtml = email.html?.body || '';
  });

  test('has semantic HTML hierarchy', async () => {
    expect(emailHtml).toMatch(/<h1/i);
    expect(emailHtml).toMatch(/<p/i);
  });

  test('links have descriptive text', async () => {
    // Ensure no "click here" links
    expect(emailHtml).not.toMatch(/>click here</i);
  });
});

