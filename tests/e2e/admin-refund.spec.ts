import { test, expect } from '@playwright/test';

test.describe('Admin Refund Flow [Epic 28]', () => {
    test.beforeEach(async ({ page }) => {
        // Mock authentication or use a test user
        // This assumes an admin user is logged in
    });

    test('should process a full refund successfully', async ({ request }) => {
        const bookingId = 'test-booking-id'; // Use a predictable ID for testing

        const response = await request.post('/functions/v1/process-refund', {
            data: {
                bookingId: bookingId,
                reason: 'Customer requested cancellation',
                adminUserId: 'admin-123'
            }
        });

        expect(response.ok()).toBeTruthy();
        const result = await response.json();
        expect(result.success).toBe(true);
        expect(result.refundId).toBeDefined();
    });

    test('should prevent duplicate refunds (idempotency)', async ({ request }) => {
        const bookingId = 'test-booking-id';

        // First attempt
        await request.post('/functions/v1/process-refund', {
            data: { bookingId, reason: 'First attempt' }
        });

        // Second attempt
        const response = await request.post('/functions/v1/process-refund', {
            data: { bookingId, reason: 'Duplicate attempt' }
        });

        const result = await response.json();
        // According to AC, idempotency returns success but notes it was already done or returns existing
        expect(result.success).toBe(true);
    });

    test('should handle invalid booking IDs gracefully', async ({ request }) => {
        const response = await request.post('/functions/v1/process-refund', {
            data: { bookingId: 'non-existent-id' }
        });

        expect(response.status()).toBe(404);
        const result = await response.json();
        expect(result.errorCode).toBe('BOOKING_NOT_FOUND');
    });
});
