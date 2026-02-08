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
  user: User | null;
}

export function CheckoutForm({ affiliateCode: initialAffiliateCode, user }: CheckoutFormProps) {
  const router = useRouter();
  const [affiliateCode, setAffiliateCode] = useState(initialAffiliateCode || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeValidation, setCodeValidation] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  // Validate affiliate code format
  const validateCodeFormat = (code: string): boolean => {
    const pattern = /^ABDU-[A-Z0-9]{6}$/;
    return pattern.test(code);
  };

  // Validate affiliate code when user types
  const handleAffiliateCodeChange = async (value: string) => {
    const upperValue = value.toUpperCase();
    setAffiliateCode(upperValue);
    setCodeValidation(null);

    // Only validate if code is not empty and has correct length
    if (upperValue.trim() === '') {
      return;
    }

    // First check format
    if (!validateCodeFormat(upperValue)) {
      if (upperValue.length >= 5) {
        setCodeValidation({
          isValid: false,
          message: 'Invalid format. Code must be ABDU-XXXXXX (6 characters after ABDU-)',
        });
      }
      return;
    }

    // If format is valid, check if code exists
    setValidatingCode(true);
    try {
      const response = await fetch('/api/affiliates/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: upperValue }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setCodeValidation({
          isValid: true,
          message: 'Valid affiliate code! You\'ll save €50.',
        });
      } else {
        setCodeValidation({
          isValid: false,
          message: data.error || 'Affiliate code not found or inactive',
        });
      }
    } catch (error) {
      setCodeValidation({
        isValid: false,
        message: 'Error validating code. Please try again.',
      });
    } finally {
      setValidatingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate affiliate code if provided
    if (affiliateCode.trim()) {
      if (!validateCodeFormat(affiliateCode)) {
        setError('Invalid affiliate code format. Code must be ABDU-XXXXXX');
        setLoading(false);
        return;
      }

      // Re-validate code before submitting
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
      } catch (validateError) {
        setError('Error validating affiliate code. Please try again.');
        setLoading(false);
        return;
      }
    }

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.userId || 'guest',
          userEmail: email,
          productId: 'forex-course-full-access',
          affiliateCode: affiliateCode.trim() || undefined,
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
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
              disabled={loading || !!user}
              placeholder="your@email.com"
            />
            {user && (
              <p className="text-xs text-muted-foreground">
                Using your account email: {user.email}
              </p>
            )}
          </div>

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
                codeValidation
                  ? codeValidation.isValid
                    ? 'border-success'
                    : 'border-destructive'
                  : ''
              }
            />
            {validatingCode && (
              <p className="text-xs text-muted-foreground">Validating code...</p>
            )}
            {codeValidation && !validatingCode && (
              <p
                className={`text-xs ${
                  codeValidation.isValid ? 'text-success' : 'text-destructive'
                }`}
              >
                {codeValidation.message}
              </p>
            )}
            {!codeValidation && !validatingCode && affiliateCode && (
              <p className="text-xs text-muted-foreground">
                Enter a valid affiliate code to save €50
              </p>
            )}
          </div>

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
