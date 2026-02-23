import { stripe } from './config';
import { getOrCreateStripeProduct } from './products';
import { AFFILIATE_DISCOUNT_AMOUNT, BASE_PRODUCT_PRICE, PROMO_CODES } from './config';

export interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  productId: string;
  affiliateCode?: string;
  promoCode?: string;
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
  promoCode,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams) {
  try {
    const { stripeProductId } = await getOrCreateStripeProduct(productId);

    const basePrice = BASE_PRODUCT_PRICE;

    // Promo code takes precedence over affiliate discount
    let finalPrice = basePrice;
    let discountAmount = 0;

    if (promoCode) {
      const normalizedPromo = promoCode.trim().toUpperCase();
      const promoPrice = PROMO_CODES[normalizedPromo];
      if (promoPrice !== undefined) {
        finalPrice = promoPrice;
        discountAmount = basePrice - promoPrice;
      }
    } else if (affiliateCode) {
      finalPrice = basePrice - AFFILIATE_DISCOUNT_AMOUNT;
      discountAmount = AFFILIATE_DISCOUNT_AMOUNT;
    }

    const price = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: finalPrice,
      currency: 'eur',
    });

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
        promoCode: promoCode || '',
        originalPrice: basePrice.toString(),
        finalPrice: finalPrice.toString(),
        discountAmount: discountAmount.toString(),
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}
