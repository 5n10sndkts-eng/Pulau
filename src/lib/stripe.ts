import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublicKey) {
  console.warn(
    'Stripe publishable key is missing. Stripe features will not work.',
  );
}

export const stripePromise = loadStripe(stripePublicKey || '');
