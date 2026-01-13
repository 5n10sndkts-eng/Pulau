// ================================================
// Email Templates Index
// Story: 30.2 - Build Email Template System
// ================================================

// Base template and components
export { wrapInBaseTemplate, components } from './base.ts';

// Utility functions
export {
  renderTemplate,
  renderTemplateRaw,
  escapeHtml,
  formatCurrency,
  formatAmount,
  formatDate,
  formatDateShort,
  generateMapsLink,
  toHtmlList,
  formatDuration,
  getImageUrl,
} from './utils.ts';

// Email templates
export {
  generateBookingConfirmationEmail,
  type BookingConfirmationData,
} from './booking-confirmation.ts';

export {
  generateBookingCancellationEmail,
  type BookingCancellationData,
} from './booking-cancellation.ts';

export {
  generateBookingReminderEmail,
  type BookingReminderData,
} from './booking-reminder.ts';
