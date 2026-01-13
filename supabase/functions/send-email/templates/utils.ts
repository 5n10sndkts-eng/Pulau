// ================================================
// Email Template Utilities
// Story: 30.2 - Build Email Template System
// ================================================

/**
 * Render template with variable substitution (Handlebars-style)
 * Replaces {{variable}} with actual values from data object
 * Missing variables return empty string (graceful fallback - AC #5)
 */
export function renderTemplate(
  template: string,
  data: Record<string, unknown>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    if (value === undefined || value === null) {
      return ''; // Graceful fallback per AC #5
    }
    return escapeHtml(String(value));
  });
}

/**
 * Render template with raw values (no HTML escaping)
 * Use for pre-escaped content like HTML snippets
 */
export function renderTemplateRaw(
  template: string,
  data: Record<string, unknown>,
): string {
  return template.replace(/\{\{\{(\w+)\}\}\}/g, (match, key) => {
    const value = data[key];
    if (value === undefined || value === null) {
      return '';
    }
    return String(value);
  });
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] ?? char);
}

/**
 * Format currency amount with proper locale formatting
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format amount with 2 decimal places (no currency symbol)
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format date in long format (e.g., "Saturday, February 15, 2026")
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date in short format (e.g., "Feb 15, 2026")
 */
export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Generate Google Maps link for a location
 */
export function generateMapsLink(location: string): string {
  const encodedLocation = encodeURIComponent(location);
  return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
}

/**
 * Convert array of items to HTML list items
 */
export function toHtmlList(items: string[]): string {
  if (!items || items.length === 0) {
    return '<li>No items specified</li>';
  }
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n');
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get experience image URL with fallback
 */
export function getImageUrl(imageUrl?: string): string {
  if (imageUrl && imageUrl.startsWith('http')) {
    return imageUrl;
  }
  // Fallback to a generic Bali experience image
  return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop';
}
