# Story 17.5: Create Consistent Error Messaging

Status: done

## Story

As a user encountering errors,
I want clear error messages,
So that I understand what went wrong.

## Acceptance Criteria

### AC1: User-Friendly Error Messages
**Given** various error conditions
**When** errors display
**Then** error messages are user-friendly (not technical):
  - Network: "Unable to connect. Check your internet connection."
  - Payment: "Payment couldn't be processed. Please try again."
  - Validation: "[Field] is required" (inline)
  - Not Found: "This experience is no longer available."
  - Server: "Something went wrong on our end. Please try again later."

### AC2: Visual Error Styling
**And** error toasts use destructive variant (red/coral)
**And** inline errors use red border and helper text
**And** all errors are recoverable (retry button or clear instructions)

## Tasks / Subtasks

### Task 1: Create Error Message Dictionary (AC: #1)
- [x] Define standard error messages for common scenarios
- [x] Map technical errors to user-friendly messages
- [x] Create error message utility function
- [x] Support i18n for future localization
- [x] Document error message guidelines for team

### Task 2: Implement Network Error Messages (AC: #1)
- [x] Detect network failures (fetch errors, timeout)
- [x] Show "Unable to connect. Check your internet connection."
- [x] Add retry button with exponential backoff
- [x] Display last successful data fetch timestamp
- [x] Test with offline mode and slow 3G

### Task 3: Implement Validation Error Messages (AC: #1, #2)
- [x] Show inline errors below form fields
- [x] Use red border on invalid inputs
- [x] Display specific validation messages (required, format, length)
- [x] Clear errors when user corrects input
- [x] Ensure ARIA attributes for screen readers

### Task 4: Implement Payment Error Messages (AC: #1)
- [x] Map payment processor errors to user-friendly messages
- [x] "Card declined" → "Payment couldn't be processed. Please check your card details."
- [x] "Insufficient funds" → "Payment failed. Please try a different payment method."
- [x] Show retry option or alternative payment methods
- [x] Never expose sensitive payment details in errors

### Task 5: Implement Server Error Messages (AC: #1)
- [x] 404 errors: "This [resource] is no longer available."
- [x] 500 errors: "Something went wrong on our end. Please try again later."
- [x] Rate limiting: "Too many requests. Please wait a moment and try again."
- [x] Maintenance mode: "We're currently upgrading. Check back soon!"
- [x] Include "Contact Support" link for persistent errors

### Task 6: Style Error Components (AC: #2)
- [x] Create Toast component with destructive variant (red/coral)
- [x] Style inline errors with red border and helper text
- [x] Add error icons (AlertCircle, XCircle) for visual cues
- [x] Ensure error text has sufficient contrast (WCAG AA)
- [x] Apply consistent spacing and typography

## Dev Notes

### Error Message Dictionary
File: `src/lib/errors.ts`
```typescript
export const ERROR_MESSAGES = {
  network: {
    offline: "Unable to connect. Check your internet connection.",
    timeout: "Request timed out. Please try again.",
    serverUnreachable: "Cannot reach server. Please check your connection.",
  },
  validation: {
    required: (field: string) => `${field} is required`,
    email: "Please enter a valid email address",
    phone: "Please enter a valid phone number",
    minLength: (field: string, min: number) =>
      `${field} must be at least ${min} characters`,
  },
  payment: {
    declined: "Payment couldn't be processed. Please check your card details.",
    insufficientFunds: "Payment failed. Please try a different payment method.",
    invalidCard: "Card details are invalid. Please check and try again.",
    generic: "Payment failed. Please try again or use a different payment method.",
  },
  notFound: {
    experience: "This experience is no longer available.",
    category: "This category doesn't exist.",
    page: "Page not found. Let's get you back on track.",
  },
  server: {
    500: "Something went wrong on our end. Please try again later.",
    503: "We're currently upgrading. Check back soon!",
    429: "Too many requests. Please wait a moment and try again.",
  },
} as const;
```

### Error Message Utility
```typescript
export const getErrorMessage = (error: any): string => {
  // Network errors
  if (!navigator.onLine) {
    return ERROR_MESSAGES.network.offline;
  }

  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return ERROR_MESSAGES.network.timeout;
  }

  // HTTP errors
  if (error.response) {
    const status = error.response.status;
    if (status === 404) return ERROR_MESSAGES.notFound.page;
    if (status === 429) return ERROR_MESSAGES.server[429];
    if (status === 500) return ERROR_MESSAGES.server[500];
    if (status === 503) return ERROR_MESSAGES.server[503];
  }

  // Payment errors
  if (error.type === 'card_error') {
    return ERROR_MESSAGES.payment.declined;
  }

  // Default generic error
  return "Something went wrong. Please try again.";
};
```

### Inline Validation Error Component
```tsx
interface FieldErrorProps {
  error?: string;
  touched?: boolean;
}

const FieldError = ({ error, touched }: FieldErrorProps) => {
  if (!error || !touched) return null;

  return (
    <p
      role="alert"
      className="mt-1 text-sm text-red-600 flex items-center gap-1"
    >
      <AlertCircle size={14} />
      {error}
    </p>
  );
};

// Usage
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    className={cn(
      "input",
      errors.email && touched.email && "border-red-500 focus:ring-red-500"
    )}
    aria-invalid={errors.email && touched.email}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  <FieldError error={errors.email} touched={touched.email} />
</div>
```

### Error Toast Component
```tsx
interface ToastProps {
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  onDismiss?: () => void;
}

const Toast = ({ message, variant = 'info', onDismiss }: ToastProps) => {
  const variantStyles = {
    success: 'bg-success-50 border-success-500 text-success-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-warning-50 border-warning-500 text-warning-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  };

  return (
    <div
      role="alert"
      className={cn(
        'border-l-4 p-4 rounded shadow-lg',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium">{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 text-current hover:opacity-70"
            aria-label="Dismiss"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
```

### Error Display Patterns

**Network Error with Retry**:
```tsx
{error && (
  <div className="text-center p-6">
    <p className="text-red-600 mb-4">
      {getErrorMessage(error)}
    </p>
    <button onClick={retry} className="btn-primary">
      Try Again
    </button>
  </div>
)}
```

**Payment Error**:
```tsx
<Toast
  variant="error"
  message="Payment couldn't be processed. Please check your card details."
/>
```

**404 Not Found**:
```tsx
<div className="text-center py-12">
  <h2 className="text-2xl font-heading font-bold mb-2">
    Experience Not Found
  </h2>
  <p className="text-gray-600 mb-6">
    This experience is no longer available.
  </p>
  <button onClick={() => navigate({ type: 'explore' })}>
    Bobjectse Other Experiences
  </button>
</div>
```

### Design Tokens
- Error text color: `text-red-600`
- Error border: `border-red-500`
- Error background: `bg-red-50`
- Error toast: `border-l-4 border-red-500 bg-red-50`
- Icon: AlertCircle or XCircle (lucide-react)

### Accessibility
- All errors use `role="alert"` for screen reader announcement
- Form errors linked with `aria-describedby`
- Invalid inputs marked with `aria-invalid="true"`
- Error messages have sufficient color contrast (4.5:1 minimum)
- Keyboard accessible dismiss buttons

### Testing Error Messages
- Test all error scenarios manually
- Verify error messages are clear and actionable
- Ensure errors don't expose sensitive information
- Test with screen reader (VoiceOver, NVDA)
- Check error message consistency across app

## References

- [Source: planning-artifacts/epics/epic-17.md#Epic 17, Story 17.5]
- [UX Writing: Error Messages](https://uxwritinghub.com/error-message-examples/)
- [WCAG: Error Identification](https://www.w3.org/WAI/WCAG21/Understanding/error-identification.html)

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

