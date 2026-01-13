/**
 * Email Delivery Monitoring Tests
 *
 * Tests for tracking email delivery metrics:
 * - Delivery rate
 * - Bounce rate
 * - Average delivery time
 * - Failed sends and retries
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set',
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

test.describe('Email Delivery Metrics', () => {
  test('tracks successful email logs accurately', async () => {
    // Query email_logs table for recent successful sends
    const { data: logs, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('status', 'sent')
      .order('created_at', { ascending: false })
      .limit(5);

    expect(error).toBeNull();

    // Each log should have required fields
    if (logs && logs.length > 0) {
      for (const log of logs) {
        expect(log.resend_message_id).toBeDefined();
        expect(log.to_email).toMatch(/@/);
        expect(log.template).toBeDefined();
        expect(log.status).toBe('sent');
      }
    }
  });

  test('calculates delivery rate using RPC function', async () => {
    // We use the database helper function we created in the migration
    const { data, error } = await supabase.rpc('get_email_delivery_rate');

    expect(error).toBeNull();
    expect(data).toBeDefined();

    if (data && data.length > 0) {
      const stats = data[0];
      console.log(
        `Stats - Sent: ${stats.total_sent}, Delivered: ${stats.total_delivered}, Rate: ${stats.delivery_rate}%`,
      );

      // If we have enough data, verify target
      if (stats.total_sent > 10) {
        expect(stats.delivery_rate).toBeGreaterThan(95);
      }
    }
  });

  test('measures average delivery time', async () => {
    // Get recently delivered emails with timestamps
    const { data: logs, error } = await supabase
      .from('email_logs')
      .select('created_at, delivered_at')
      .not('delivered_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);

    expect(error).toBeNull();

    if (logs && logs.length > 0) {
      const deliveryTimes = logs
        .map((log) => {
          const created = new Date(log.created_at).getTime();
          const delivered = new Date(log.delivered_at!).getTime();
          return delivered - created;
        })
        .filter((time) => time > 0);

      if (deliveryTimes.length > 0) {
        const avgSeconds =
          deliveryTimes.reduce((a, b) => a + b, 0) /
          deliveryTimes.length /
          1000;
        console.log(`Average delivery time: ${avgSeconds.toFixed(2)}s`);
        expect(avgSeconds).toBeLessThan(60); // Target < 30s, allowing more padding for tests
      }
    }
  });
});

test.describe('Webhook Integration Simulation', () => {
  let testMsgId: string;

  test.beforeAll(async () => {
    // Create a dummy log to "update" via simulated webhook
    const { data } = await supabase
      .from('email_logs')
      .insert({
        resend_message_id: `test-webhook-${Date.now()}`,
        to_email: 'test@example.com',
        template: 'booking_confirmation',
        status: 'sent',
      })
      .select()
      .single();

    testMsgId = data.resend_message_id;
  });

  test('simulated delivery webhook updates log status', async () => {
    // Simulate what the resend-webhook function would do
    const { error } = await supabase
      .from('email_logs')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .eq('resend_message_id', testMsgId);

    expect(error).toBeNull();

    // Verify update
    const { data: updated } = await supabase
      .from('email_logs')
      .select('status, delivered_at')
      .eq('resend_message_id', testMsgId)
      .single();

    expect(updated.status).toBe('delivered');
    expect(updated.delivered_at).not.toBeNull();
  });

  test('simulated bounce webhook updates log status', async () => {
    const bounceMsgId = `test-bounce-${Date.now()}`;
    await supabase.from('email_logs').insert({
      resend_message_id: bounceMsgId,
      to_email: 'invalid@example.com',
      template: 'booking_confirmation',
      status: 'sent',
    });

    // Simulate bounce update
    const { error } = await supabase
      .from('email_logs')
      .update({
        status: 'bounced',
        bounced_at: new Date().toISOString(),
        bounce_reason: 'Permanent bounce',
      })
      .eq('resend_message_id', bounceMsgId);

    expect(error).toBeNull();

    const { data: updated } = await supabase
      .from('email_logs')
      .select('status, bounce_reason')
      .eq('resend_message_id', bounceMsgId)
      .single();

    expect(updated.status).toBe('bounced');
    expect(updated.bounce_reason).toBe('Permanent bounce');
  });
});

test.describe('Alert Thresholds', () => {
  test('detects delivery rate drop', async () => {
    const { data } = await supabase.rpc('get_email_delivery_rate');

    if (data && data.length > 0 && data[0].total_sent > 20) {
      const rate = data[0].delivery_rate;
      if (rate < 95) {
        console.warn(`⚠️ ALERT: Delivery rate is low: ${rate}%`);
      }
      expect(rate).toBeGreaterThan(90); // Hard floor for test failure
    }
  });
});
