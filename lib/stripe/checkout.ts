import { stripe } from './config';
import { getOrCreateStripeProduct } from './products';
import { AFFILIATE_DISCOUNT_AMOUNT, BASE_PRODUCT_PRICE } from './config';

export interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  productId: string;
  affiliateCode?: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  productId,
  affiliateCode,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams) {
  try {
    // Get or create Stripe product
    const { stripeProductId } = await getOrCreateStripeProduct(productId);

    // Calculate price (apply discount if affiliate code provided)
    const basePrice = BASE_PRODUCT_PRICE; // €399
    const finalPrice = affiliateCode ? basePrice - AFFILIATE_DISCOUNT_AMOUNT : basePrice; // €349 or €399

    // Create a price for this specific checkout (with or without discount)
    // We create a one-time price for the exact amount
    const price = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: finalPrice,
      currency: 'eur',
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: userEmail,
      metadata: {
        userId,
        productId,
        affiliateCode: affiliateCode || '',
        originalPrice: basePrice.toString(),
        finalPrice: finalPrice.toString(),
        discountAmount: affiliateCode ? AFFILIATE_DISCOUNT_AMOUNT.toString() : '0',
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}
