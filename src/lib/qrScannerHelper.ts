import jsQR from 'jsqr';

interface QRScanResult {
  success: boolean;
  bookingId: string | null;
  error?: string;
}

/**
 * Expected QR data format: JSON with bookingId field or plain booking reference
 */
interface QRData {
  bookingId?: string;
  bookingReference?: string;
  type?: 'pulau-ticket';
  ref?: string;
}

/**
 * Extracts booking ID from Pulau QR code format
 * Expected format: pulau://booking/{bookingId}
 * Also supports JSON, URLs with params, and raw UUIDs
 */
export function extractBookingId(data: string): string | null {
  try {
    // Handle pulau://ticket?bookingId=... or pulse://booking/ID or https links
    if (data.startsWith('pulau://booking/')) {
      return data.replace('pulau://booking/', '').trim();
    }

    try {
      const maybeUrl = new URL(data);
      const fromQuery =
        maybeUrl.searchParams.get('bookingId') ||
        maybeUrl.searchParams.get('ref') ||
        maybeUrl.searchParams.get('id');
      if (fromQuery) return fromQuery;
    } catch {
      // Not a URL; continue
    }

    // Try parsing as JSON first (structured ticket format)
    try {
      const parsed: QRData = JSON.parse(data);

      // Check for Pulau ticket format
      if (parsed.type === 'pulau-ticket') {
        return (
          parsed.bookingId || parsed.bookingReference || parsed.ref || null
        );
      }

      // Fallback to any booking ID field
      return parsed.bookingId || parsed.bookingReference || parsed.ref || null;
    } catch {
      // Not JSON - treat as patterns
      const UUID_PATTERN =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const REF_PATTERN = /^PUL-[A-Z0-9]{6,}$/i;

      if (UUID_PATTERN.test(data) || REF_PATTERN.test(data)) {
        return data.trim();
      }

      // Allow any alphanumeric string of reasonable length as fallback
      if (/^[A-Za-z0-9-]{6,50}$/.test(data)) {
        return data.trim();
      }
    }
  } catch (err) {
    console.error('Error extracting booking ID:', err);
  }

  return null;
}

/**
 * Scans image data for a QR code and returns the booking ID if found
 */
export function scanQRCode(imageData: ImageData): QRScanResult {
  try {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
      const bookingId = extractBookingId(code.data);
      if (bookingId) {
        return { success: true, bookingId };
      }
      return {
        success: false,
        bookingId: null,
        error: 'Invalid QR code format',
      };
    }

    return { success: false, bookingId: null };
  } catch (err) {
    console.error('QR Scan error:', err);
    return { success: false, bookingId: null, error: 'Decoding failed' };
  }
}
