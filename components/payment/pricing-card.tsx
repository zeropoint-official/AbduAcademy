'use client';

import { Check } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BASE_PRODUCT_PRICE, AFFILIATE_DISCOUNT_AMOUNT } from '@/lib/stripe/config';

interface PricingCardProps {
  affiliateCode?: string;
}

export function PricingCard({ affiliateCode }: PricingCardProps) {
  const basePrice = BASE_PRODUCT_PRICE / 100; // Convert cents to euros
  const discountAmount = AFFILIATE_DISCOUNT_AMOUNT / 100;
  const finalPrice = affiliateCode ? basePrice - discountAmount : basePrice;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl">Course Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          {affiliateCode ? (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">€{finalPrice.toFixed(2)}</span>
                <span className="text-xl text-muted-foreground line-through">
                  €{basePrice.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-primary font-medium">
                You saved €{discountAmount.toFixed(2)} with affiliate code!
              </p>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">€{basePrice.toFixed(2)}</span>
              <span className="text-muted-foreground">one-time payment</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">What's included:</h3>
          <ul className="space-y-2">
            {[
              'Lifetime access to all course content',
              '20+ HD video lessons',
              'Live trading examples',
              '1-on-1 mentorship included',
              'Private community access',
              'All future updates',
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" weight="bold" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
