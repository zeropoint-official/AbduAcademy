import { stripe } from './config';
import { products } from '@/lib/appwrite/database';
import { ID, Query } from 'appwrite';

export interface StripeProduct {
  stripeProductId: string;
  stripePriceId: string;
}

/**
 * Sync a product from Appwrite to Stripe
 * Creates or updates Stripe product and price
 */
export async function syncProductToStripe(productId: string) {
  try {
    // Get product from Appwrite
    const appwriteProducts = await products.list<{
      productId: string;
      name: string;
      description: string;
      price: number;
      stripeProductId?: string;
      stripePriceId?: string;
    }>([Query.equal('productId', productId)]);

    if (appwriteProducts.documents.length === 0) {
      throw new Error(`Product ${productId} not found in Appwrite`);
    }

    const product = appwriteProducts.documents[0];

    let stripeProductId = product.stripeProductId;
    let stripePriceId = product.stripePriceId;

    // Create or update Stripe product
    if (stripeProductId) {
      try {
        // Try to update existing product
        await stripe.products.update(stripeProductId, {
          name: product.name,
          description: product.description,
        });
      } catch {
        // Product doesn't exist in this mode (e.g. test vs live mismatch) — create new
        const stripeProduct = await stripe.products.create({
          name: product.name,
          description: product.description,
        });
        stripeProductId = stripeProduct.id;
      }
    } else {
      // Create new product
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
      });
      stripeProductId = stripeProduct.id;
    }

    // Create new price (Stripe doesn't allow updating prices, so we create a new one)
    const stripePrice = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: product.price,
      currency: 'eur',
    });
    stripePriceId = stripePrice.id;

    // Update Appwrite product with Stripe IDs
    interface ProductDocument {
      $id: string;
      productId: string;
    }
    
    const productDoc = await products.list<ProductDocument>([Query.equal('productId', productId)]);
    if (productDoc.documents.length > 0) {
      await products.update(productDoc.documents[0].$id, {
        stripeProductId,
        stripePriceId,
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      stripeProductId,
      stripePriceId,
    };
  } catch (error) {
    console.error('Error syncing product to Stripe:', error);
    throw error;
  }
}

/**
 * Get or create Stripe product for a given Appwrite product
 */
export async function getOrCreateStripeProduct(productId: string): Promise<StripeProduct> {
  try {
    const appwriteProducts = await products.list<{
      productId: string;
      stripeProductId?: string;
      stripePriceId?: string;
    }>([Query.equal('productId', productId)]);

    if (appwriteProducts.documents.length === 0) {
      throw new Error(`Product ${productId} not found`);
    }

    const product = appwriteProducts.documents[0];

    // If Stripe IDs exist, return them
    if (product.stripeProductId && product.stripePriceId) {
      // Verify the price still exists and is active
      try {
        const price = await stripe.prices.retrieve(product.stripePriceId);
        if (price.active) {
          return {
            stripeProductId: product.stripeProductId,
            stripePriceId: product.stripePriceId,
          };
        }
      } catch (error) {
        // Price doesn't exist, need to recreate
      }
    }

    // Sync to Stripe
    return await syncProductToStripe(productId);
  } catch (error) {
    console.error('Error getting Stripe product:', error);
    throw error;
  }
}
