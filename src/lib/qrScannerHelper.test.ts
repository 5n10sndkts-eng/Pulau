import { describe, it, expect } from 'vitest';
import { extractBookingId } from './qrScannerHelper';

describe('qrScannerHelper', () => {
  describe('extractBookingId', () => {
    it('extracts ID from pulau://booking/ format', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const data = `pulau://booking/${id}`;
      expect(extractBookingId(data)).toBe(id);
    });

    it('extracts ID from URL with query params', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const data = `https://pulau.app/check-in?bookingId=${id}&other=param`;
      expect(extractBookingId(data)).toBe(id);

      const dataRef = `https://pulau.app/t?ref=PUL-ABC123`;
      expect(extractBookingId(dataRef)).toBe('PUL-ABC123');
    });

    it('extracts ID from JSON pulau-ticket format', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const data = JSON.stringify({
        type: 'pulau-ticket',
        bookingId: id,
        ref: 'PUL-ABC123',
      });
      expect(extractBookingId(data)).toBe(id);
    });

    it('extracts ID from plain JSON with bookingId field', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const data = JSON.stringify({ bookingId: id });
      expect(extractBookingId(data)).toBe(id);
    });

    it('extracts ID from raw UUID', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      expect(extractBookingId(id)).toBe(id);
    });

    it('extracts ID from raw PUL reference', () => {
      const ref = 'PUL-X98273';
      expect(extractBookingId(ref)).toBe(ref);
    });

    it('returns null for invalid garbage data', () => {
      expect(extractBookingId('some random string')).toBe(null);
      expect(extractBookingId('')).toBe(null);
    });

    it('handles malformed JSON', () => {
      expect(extractBookingId('{ malformed json }')).toBe(null);
    });
  });
});
