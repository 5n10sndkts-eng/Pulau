### Story 10.7: Implement Form Validation with Zod

As a developer,
I want consistent form validation across checkout,
So that user input is validated reliably.

**Acceptance Criteria:**

**Given** checkout forms use React Hook Form
**When** Zod schemas are defined
**Then** travelerDetailsSchema validates:

- firstName: string, min 1, max 50
- lastName: string, min 1, max 50
- email: valid email format
- phone: valid phone format (international)
  **And** paymentSchema validates:
- cardNumber: 13-19 digits (Luhn algorithm)
- expiryDate: MM/YY format, not expired
- cvv: 3-4 digits
- cardholderName: string, min 2
  **And** validation errors display user-friendly messages
  **And** form submission is blocked until valid
