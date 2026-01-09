# Story 10.7: Implement Form Validation with Zod

Status: done

## Story

As a developer,
I want consistent form validation across checkout,
So that user input is validated reliably.

## Acceptance Criteria

**AC #1: Define Zod schemas for checkout forms**
**Given** checkout forms use React Hook Form
**When** Zod schemas are defined
**Then** travelerDetailsSchema validates:
  - firstName: string, min 1, max 50
  - lastName: string, min 1, max 50
  - email: valid email format
  - phone: valid phone format (international)

**AC #2: Define payment validation schema**
**And** paymentSchema validates:
  - cardNumber: 13-19 digits (Luhn algorithm)
  - expiryDate: MM/YY format, not expired
  - cvv: 3-4 digits
  - cardholderName: string, min 2

**AC #3: Display user-friendly error messages**
**And** validation errors display user-friendly messages
**And** form submission is blocked until valid

## Tasks / Subtasks

### Task 1: Create travelerDetailsSchema with Zod (AC: #1)
- [x] Define travelerDetailsSchema in shared schemas file
- [x] Add validation rules for firstName, lastName, email, phone
- [x] Add custom error messages for each field
- [x] Export schema and infer TypeScript type
- [x] Write unit tests for schema validation

### Task 2: Create paymentSchema with Zod (AC: #2)
- [x] Define paymentSchema for card payment fields
- [x] Add cardNumber validation with Luhn algorithm
- [x] Add expiryDate validation (MM/YY format, not expired)
- [x] Add cvv validation (3-4 digits based on card type)
- [x] Add cardholderName validation (min 2 characters)

### Task 3: Implement custom Zod validators (AC: #2)
- [x] Create custom Luhn algorithm validator for card numbers
- [x] Create custom validator for expiry date (not expired)
- [x] Create phone number validator (international format)
- [x] Add regex patterns for common validations
- [x] Export validators for reuse

### Task 4: Integrate schemas with React Hook Form (AC: #1, #2, #3)
- [x] Use zodResolver in useForm hook
- [x] Connect validation errors to form field error display
- [x] Configure validation mode: 'onBlur' for better UX
- [x] Test form submission blocking on invalid data
- [x] Add loading state during async validation (if needed)

### Task 5: Create user-friendly error message mappings (AC: #3)
- [x] Map Zod error codes to readable messages
- [x] Customize messages per field (e.g., "Email is required" vs "Invalid email")
- [x] Add helper text for complex validations (e.g., phone format)
- [x] Test error messages for all validation scenarios
- [x] Ensure messages are clear and actionable

## Dev Notes

### Technical Guidance
- Zod library: `npm install zod`
- React Hook Form integration: `@hookform/resolvers/zod`
- Luhn algorithm: implement custom validation function
- Phone validation: use regex or libphonenumber-js
- Error messages: override default Zod messages with custom text

### Traveler Details Schema
```typescript
import { z } from 'zod';

export const travelerDetailsSchema = z.object({
  primaryContact: z.object({
    firstName: z.string()
      .min(1, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    lastName: z.string()
      .min(1, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    email: z.string()
      .email("Please enter a valid email address"),
    phone: z.string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number (e.g., +1234567890)")
  }),
  tripLeadSameAsContact: z.boolean().default(true),
  tripLead: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional()
  }).optional(),
  specialRequests: z.string()
    .max(500, "Special requests must be less than 500 characters")
    .optional()
});

export type TravelerDetailsFormData = z.infer<typeof travelerDetailsSchema>;
```

### Payment Schema with Luhn Validation
```typescript
const luhnCheck = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

const isExpiryValid = (expiry: string): boolean => {
  const [month, year] = expiry.split('/').map(Number);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Last 2 digits
  const currentMonth = currentDate.getMonth() + 1;

  if (month < 1 || month > 12) return false;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

export const paymentSchema = z.object({
  cardNumber: z.string()
    .refine(luhnCheck, "Invalid card number"),
  expiryDate: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be in MM/YY format")
    .refine(isExpiryValid, "Card has expired"),
  cvv: z.string()
    .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
  cardholderName: z.string()
    .min(2, "Cardholder name is required")
    .max(100, "Name is too long")
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
```

### React Hook Form Integration
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const TravelerDetailsForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<TravelerDetailsFormData>({
    resolver: zodResolver(travelerDetailsSchema),
    mode: 'onBlur' // Validate on field blur
  });

  const onSubmit = (data: TravelerDetailsFormData) => {
    // Form is valid, proceed
    saveToCheckoutSession(data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('primaryContact.firstName')}
        error={errors.primaryContact?.firstName?.message}
      />
      {/* ... other fields */}
      <Button type="submit" disabled={!isValid}>
        Continue
      </Button>
    </form>
  );
};
```

### Unit Tests
```typescript
import { describe, it, expect } from 'vitest';

describe('travelerDetailsSchema', () => {
  it('validates valid traveler details', () => {
    const validData = {
      primaryContact: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      },
      tripLeadSameAsContact: true
    };

    const result = travelerDetailsSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const invalidData = {
      primaryContact: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '+1234567890'
      }
    };

    const result = travelerDetailsSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

## References

- [Source: planning-artifacts/epics/epic-10.md#Epic 10, Story 10.7]
- [Source: prd/pulau-prd.md#Form Validation]
- [Related: Story 10.3 - Build Step 2 - Traveler Details Form]
- [Related: Story 10.4 - Build Step 3 - Payment Screen]
- [Technical: Zod Documentation]
- [Technical: React Hook Form with Zod]

## Dev Agent Record

### Agent Model Used

GitHub Spark AI Agent

### Debug Log References

### Completion Notes List

- ✅ Story synchronized with codebase implementation state

### File List
- See `/src` directory for component implementations

