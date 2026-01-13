# Task 2.4: Set Up Stripe Production Account & Keys

Status: not-started
Phase: Launch Readiness Sprint - Phase 2
Priority: P0
Type: Payment Integration

## Task Description

Configure Stripe production account with Connect platform capabilities, verify business details, and generate production API keys for payment processing.

## Acceptance Criteria

- [ ] Stripe account activated for production
- [ ] Business details verified
- [ ] Connect platform enabled
- [ ] Production API keys generated
- [ ] Webhook endpoints configured
- [ ] Tax settings configured
- [ ] Payout schedule set

## Steps

### 1. Activate Stripe Production Mode

1. Log in to Stripe Dashboard
2. Toggle from "Test mode" to "Live mode" (top right)
3. Complete "Activate your account" checklist:
   - Business details
   - Bank account for payouts
   - Identity verification
   - Tax information

### 2. Complete Business Verification

**Required Information:**

- Business legal name: [Your Business Name]
- Business type: LLC / Corporation / Sole Proprietor
- Tax ID (EIN): [Your EIN]
- Business address
- Website: https://pulau.app
- Business description: "Marketplace platform connecting travelers with local experiences"
- MCC Code: 7999 (Recreation Services)

**Bank Account:**

- Account holder name
- Routing number
- Account number
- Account type: Checking

**Identity Verification:**

- Upload government ID
- Provide SSN/EIN
- Verify phone number

### 3. Enable Stripe Connect

1. Navigate to Connect settings
2. Enable "Platform" integration
3. Configure Connect settings:
   - Branding: Upload Pulau logo
   - Support email: support@pulau.app
   - Support phone: [Your phone]
   - Privacy policy: https://pulau.app/privacy
   - Terms of service: https://pulau.app/terms

4. Set platform fee: 15% application fee
5. Configure connected account types: "Standard"

### 4. Generate Production API Keys

```bash
# Navigate to Developers → API keys in Stripe Dashboard

# Copy keys:
Publishable key: pk_live_...
Secret key: sk_live_...
```

**Store keys securely:**

```bash
# Add to password manager
# Add to Supabase secrets (see Task 2.3)
supabase secrets set STRIPE_SECRET_KEY=sk_live_...

# Add to frontend hosting
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
```

### 5. Configure Webhook Endpoints

1. Navigate to Developers → Webhooks
2. Add endpoint:
   - URL: `https://[PROJECT-REF].supabase.co/functions/v1/stripe-webhook`
   - Events to listen:
     - `checkout.session.completed`
     - `checkout.session.expired`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `account.updated` (for connected accounts)
     - `account.application.deauthorized`
     - `charge.refunded`

3. Copy webhook signing secret:

   ```bash
   whsec_...

   # Store securely
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 6. Configure Payment Settings

**Payment Methods:**

- Enable: Cards (Visa, Mastercard, Amex)
- Consider: Apple Pay, Google Pay
- Disable: ACH, Wire (for MVP)

**Currency:**

- Default: USD
- Additional: EUR, GBP, CAD (if international)

**Checkout Settings:**

- Enable automatic tax calculation
- Configure receipt emails
- Set up payment confirmation emails

**Radar (Fraud Prevention):**

- Enable default fraud rules
- Set risk threshold: Medium
- Review blocked payments daily

### 7. Set Payout Schedule

**Platform Payouts:**

- Frequency: Daily (rolling)
- Speed: Standard (2 business days)

**Connected Account Payouts:**

- Frequency: Daily
- Delay: 2 days after successful charge
- Minimum payout: $1

### 8. Configure Tax Settings

1. Enable automatic tax collection (if applicable)
2. Configure tax rates by location
3. Set up tax reporting
4. Link to accounting software (QuickBooks/Xero)

## Validation Tests

### Test Production Keys

```bash
# Test secret key
curl https://api.stripe.com/v1/payment_intents \
  -u sk_live_...: \
  -d "amount=1000" \
  -d "currency=usd"
# Should return payment intent object

# Test webhook
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
stripe trigger checkout.session.completed
```

### Test Connect Onboarding

```typescript
// Test vendor onboarding flow in production
const accountLink = await stripe.accountLinks.create({
  account: 'acct_...',
  refresh_url: 'https://pulau.app/vendor/onboard/refresh',
  return_url: 'https://pulau.app/vendor/onboard/complete',
  type: 'account_onboarding',
});
```

### Test Payment Flow

1. Create test checkout session with production keys
2. Use Stripe test card: 4242 4242 4242 4242
3. Verify webhook delivery
4. Check payment in Stripe Dashboard
5. Verify platform fee deducted correctly

## Security Checklist

- [ ] Production keys never committed to git
- [ ] Keys stored in password manager
- [ ] Webhook secret verified on each request
- [ ] API keys restricted by IP (if possible)
- [ ] Team members have appropriate Stripe roles
- [ ] Two-factor authentication enabled on Stripe account
- [ ] Payment failure alerts configured

## Compliance Requirements

**PCI Compliance:**

- Use Stripe Elements/Checkout (no card data on server) ✅
- Serve site over HTTPS ✅
- Use latest Stripe API version ✅

**Data Protection:**

- Never log full card numbers
- Encrypt sensitive data at rest
- Follow GDPR/CCPA guidelines

## Related Files

- `supabase/functions/stripe-webhook/index.ts` (verify signature)
- `supabase/functions/vendor-onboard/index.ts` (Connect flow)
- `src/lib/stripe.ts` (initialize with production key)
- `docs/stripe-production-setup.md` (create documentation)

## Estimated Time

2-3 hours (including verification wait times)

## Dependencies

- Business entity formed
- Bank account for payouts
- Tax ID (EIN)
- Government ID for verification

## Success Validation

- [ ] Stripe account shows "Live mode activated"
- [ ] Business details verified (green checkmark)
- [ ] Production API keys generated
- [ ] Webhooks configured and testing successfully
- [ ] Test payment completes successfully
- [ ] Platform fee calculated correctly
- [ ] Connected account onboarding works

## Common Issues

| Issue                        | Solution                                                  |
| ---------------------------- | --------------------------------------------------------- |
| Account verification pending | Can take 1-3 business days, follow up with Stripe support |
| Webhook signature fails      | Verify webhook secret matches Stripe dashboard            |
| Payment declined             | Check Radar rules, may need to adjust thresholds          |
| Connected account issues     | Verify redirect URLs match exactly                        |
| Platform fee not applied     | Check application_fee_amount in payment intent            |

## Post-Setup

- Monitor first 100 transactions closely
- Review Radar fraud reports daily
- Set up email alerts for failed payments
- Schedule weekly payout reconciliation
- Plan for international expansion (multi-currency)

## Stripe Support Resources

- Dashboard: https://dashboard.stripe.com
- Documentation: https://stripe.com/docs
- Support: support@stripe.com
- Status page: https://status.stripe.com
