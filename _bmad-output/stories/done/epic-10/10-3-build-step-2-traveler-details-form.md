# Story 10.3: Build Step 2 - Traveler Details Form

Status: ready-for-dev

## Story

As a traveler in checkout,
I want to enter my contact and traveler information,
So that operators can reach me.

## Acceptance Criteria

**AC #1: Display traveler details form**
**Given** I am on checkout Step 2 (Traveler Details)
**When** the screen loads
**Then** form displays fields (pre-filled if logged in):
  - Primary Contact: First Name*, Last Name*, Email*, Phone*
  - Trip Lead: Same as contact (checkbox), or separate fields
  - Special Requests: textarea (optional)
**And** fields marked with * are required

**AC #2: Validate form with React Hook Form and Zod**
**And** form uses React Hook Form with Zod validation schema

**AC #3: Show inline validation errors**
**When** I submit with missing required fields
**Then** validation errors display inline below each field
**And** error border (red) highlights invalid fields

**AC #4: Enable continue on valid form**
**When** all required fields are valid
**Then** "Continue to Payment" button enables
**And** form data persists to checkout session state

## Tasks / Subtasks

### Task 1: Create TravelerDetailsStep form component (AC: #1)
- [ ] Build TravelerDetailsStep with React Hook Form
- [ ] Add Primary Contact fields: firstName, lastName, email, phone
- [ ] Add "Trip lead is same as contact" checkbox
- [ ] Conditionally show Trip Lead fields if unchecked
- [ ] Add Special Requests textarea (optional, 500 char max)

### Task 2: Implement Zod validation schema (AC: #2, #3)
- [ ] Create travelerDetailsSchema with Zod
- [ ] Validate firstName: string, min 1, max 50
- [ ] Validate lastName: string, min 1, max 50
- [ ] Validate email: valid email format
- [ ] Validate phone: valid international phone format

### Task 3: Add inline error display (AC: #3)
- [ ] Show validation errors below each field
- [ ] Apply red border to invalid fields
- [ ] Display user-friendly error messages
- [ ] Clear errors on field blur when valid
- [ ] Add helper text for phone format (e.g., "+1234567890")

### Task 4: Pre-fill form from user profile (AC: #1)
- [ ] Check if user is logged in
- [ ] Pre-populate fields from user_profiles KV namespace
- [ ] Allow editing of pre-filled values
- [ ] Show "Logged in as [email]" indicator
- [ ] Add "Use different email" option if needed

### Task 5: Implement continue button with validation (AC: #4)
- [ ] Disable "Continue to Payment" until form is valid
- [ ] Save form data to checkout session on continue
- [ ] Advance to Step 3 (Payment)
- [ ] Scroll to top on step change
- [ ] Add loading state during save

## Dev Notes

### Technical Guidance
- Use React Hook Form: `useForm()` with Zod resolver
- Zod schema: `zodResolver(travelerDetailsSchema)`
- Phone validation: use `libphonenumber-js` or regex pattern
- Pre-fill: check auth state and fetch user profile
- Session persistence: save to checkout_session.travelerDetails

### Zod Validation Schema
```typescript
import { z } from 'zod';

const travelerDetailsSchema = z.object({
  primaryContact: z.object({
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
  }),
  tripLeadSameAsContact: z.boolean(),
  tripLead: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional()
  }).optional(),
  specialRequests: z.string().max(500, "Max 500 characters").optional()
});

type TravelerDetailsFormData = z.infer<typeof travelerDetailsSchema>;
```

### Form Implementation
```typescript
const TravelerDetailsStep = () => {
  const { register, handleSubmit, formState: { errors, isValid }, watch } = useForm<TravelerDetailsFormData>({
    resolver: zodResolver(travelerDetailsSchema),
    mode: 'onBlur'
  });

  const tripLeadSameAsContact = watch('tripLeadSameAsContact');

  const onSubmit = (data: TravelerDetailsFormData) => {
    saveToCheckoutSession({ travelerDetails: data });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="First Name *"
        error={errors.primaryContact?.firstName?.message}
        {...register('primaryContact.firstName')}
      />
      {/* ... other fields */}
      <Button type="submit" disabled={!isValid}>
        Continue to Payment
      </Button>
    </form>
  );
};
```

### Visual Specifications
- Form layout: single column, max-width 600px
- Field spacing: 20px vertical gap
- Input height: 48px (44px + 4px padding)
- Error text: 12px, red color, below field
- Required asterisk: red color next to label
- Textarea: min-height 100px, resizable

## References

- [Source: planning-artifacts/epics/epic-10.md#Epic 10, Story 10.3]
- [Source: prd/pulau-prd.md#Checkout Step 2]
- [Related: Story 10.7 - Implement Form Validation with Zod]
- [Technical: React Hook Form Documentation]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
