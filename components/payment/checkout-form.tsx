'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/lib/appwrite/auth';

interface CheckoutFormProps {
  affiliateCode?: string;
  user: User;
  onPromoApplied?: (promoCode: string | null, finalPrice: number | null) => void;
}

export function CheckoutForm({ affiliateCode: initialAffiliateCode, user, onPromoApplied }: CheckoutFormProps) {
  const router = useRouter();
  const [affiliateCode, setAffiliateCode] = useState(initialAffiliateCode || '');
  const [promoCode, setPromoCode] = useState('');
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [validatingAffiliate, setValidatingAffiliate] = useState(false);
  const [affiliateValidation, setAffiliateValidation] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoValidation, setPromoValidation] = useState<{
    isValid: boolean;
    message: string;
    finalPrice?: number;
  } | null>(null);

  const validateAffiliateFormat = (code: string): boolean => {
    const pattern = /^ABDU-[A-Z0-9]{6}$/;
    return pattern.test(code);
  };

  const handleAffiliateCodeChange = async (value: string) => {
    const upperValue = value.toUpperCase();
    setAffiliateCode(upperValue);
    setAffiliateValidation(null);

    if (upperValue.trim() === '') return;

    if (!validateAffiliateFormat(upperValue)) {
      if (upperValue.length >= 5) {
        setAffiliateValidation({
          isValid: false,
          message: 'Invalid format. Code must be ABDU-XXXXXX (6 characters after ABDU-)',
        });
      }
      return;
    }

    setValidatingAffiliate(true);
    try {
      const response = await fetch('/api/affiliates/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: upperValue }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAffiliateValidation({
          isValid: true,
          message: 'Valid affiliate code! You\'ll save €50.',
        });
      } else {
        setAffiliateValidation({
          isValid: false,
          message: data.error || 'Affiliate code not found or inactive',
        });
      }
    } catch {
      setAffiliateValidation({
        isValid: false,
        message: 'Error validating code. Please try again.',
      });
    } finally {
      setValidatingAffiliate(false);
    }
  };

  const handlePromoCodeChange = async (value: string) => {
    const upperValue = value.toUpperCase();
    setPromoCode(upperValue);
    setPromoValidation(null);
    onPromoApplied?.(null, null);

    if (upperValue.trim() === '') return;

    setValidatingPromo(true);
    try {
      const response = await fetch('/api/stripe/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: upperValue }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        const savedAmount = (data.originalPrice - data.finalPrice) / 100;
        const promoFinalPrice = data.finalPrice / 100;
        setPromoValidation({
          isValid: true,
          message: `Promo applied! You pay €${promoFinalPrice} (save €${savedAmount})`,
          finalPrice: data.finalPrice,
        });
        onPromoApplied?.(upperValue, data.finalPrice);
      } else {
        setPromoValidation({
          isValid: false,
          message: data.error || 'Invalid promo code',
        });
      }
    } catch {
      setPromoValidation({
        isValid: false,
        message: 'Error validating promo code. Please try again.',
      });
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate promo code if provided
    if (promoCode.trim()) {
      try {
        const promoResponse = await fetch('/api/stripe/validate-promo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: promoCode }),
        });
        const promoData = await promoResponse.json();
        if (!promoResponse.ok || !promoData.valid) {
          setError(promoData.error || 'Invalid promo code');
          setLoading(false);
          return;
        }
      } catch {
        setError('Error validating promo code. Please try again.');
        setLoading(false);
        return;
      }
    }

    // Validate affiliate code if provided and no promo
    if (!promoCode.trim() && affiliateCode.trim()) {
      if (!validateAffiliateFormat(affiliateCode)) {
        setError('Invalid affiliate code format. Code must be ABDU-XXXXXX');
        setLoading(false);
        return;
      }

      try {
        const validateResponse = await fetch('/api/affiliates/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: affiliateCode }),
        });
        const validateData = await validateResponse.json();
        if (!validateResponse.ok || !validateData.valid) {
          setError(validateData.error || 'Invalid affiliate code');
          setLoading(false);
          return;
        }
      } catch {
        setError('Error validating affiliate code. Please try again.');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          userEmail: email,
          productId: 'forex-course-full-access',
          promoCode: promoCode.trim() || undefined,
          affiliateCode: affiliateCode.trim() || undefined,
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Purchase</CardTitle>
        <CardDescription>Enter your details to proceed to secure checkout</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled
              placeholder="your@email.com"
            />
            <p className="text-xs text-muted-foreground">
              Using your account email: {user.email}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="promoCode">Promo Code (Optional)</Label>
            <Input
              id="promoCode"
              type="text"
              value={promoCode}
              onChange={(e) => handlePromoCodeChange(e.target.value)}
              disabled={loading}
              placeholder="Enter promo code"
              className={
                promoValidation
                  ? promoValidation.isValid
                    ? 'border-success'
                    : 'border-destructive'
                  : ''
              }
            />
            {validatingPromo && (
              <p className="text-xs text-muted-foreground">Validating promo code...</p>
            )}
            {promoValidation && !validatingPromo && (
              <p
                className={`text-xs ${
                  promoValidation.isValid ? 'text-success' : 'text-destructive'
                }`}
              >
                {promoValidation.message}
              </p>
            )}
          </div>

          {!promoValidation?.isValid && (
            <div className="space-y-2">
              <Label htmlFor="affiliateCode">Affiliate Code (Optional)</Label>
              <Input
                id="affiliateCode"
                type="text"
                value={affiliateCode}
                onChange={(e) => handleAffiliateCodeChange(e.target.value)}
                disabled={loading}
                placeholder="ABDU-XXXXXX"
                maxLength={13}
                className={
                  affiliateValidation
                    ? affiliateValidation.isValid
                      ? 'border-success'
                      : 'border-destructive'
                    : ''
                }
              />
              {validatingAffiliate && (
                <p className="text-xs text-muted-foreground">Validating code...</p>
              )}
              {affiliateValidation && !validatingAffiliate && (
                <p
                  className={`text-xs ${
                    affiliateValidation.isValid ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {affiliateValidation.message}
                </p>
              )}
              {!affiliateValidation && !validatingAffiliate && affiliateCode && (
                <p className="text-xs text-muted-foreground">
                  Enter a valid affiliate code to save €50
                </p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading || !email}>
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure checkout powered by Stripe
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
