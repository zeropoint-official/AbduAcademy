import Stripe from 'stripe';

// Client-side publishable key (safe to use on client)
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
}

// Currency
export const CURRENCY = 'eur'; // Euro

// Affiliate discount amount in cents (€50)
export const AFFILIATE_DISCOUNT_AMOUNT = 5000;

// Base product price in cents (€399)
export const BASE_PRODUCT_PRICE = 39900;

// Server-side only code - only execute on server
let stripeInstance: Stripe | null = null;
let webhookSecret: string | undefined;

if (typeof window === 'undefined') {
  // Only check and initialize on server side
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
  });

  webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
}

// Server-side Stripe client (only available on server)
export const stripe = stripeInstance!;

// Webhook secret (server-side only)
export const STRIPE_WEBHOOK_SECRET = webhookSecret;
