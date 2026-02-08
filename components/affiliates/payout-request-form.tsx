'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface PayoutRequestFormProps {
  availableEarnings: number; // in cents
  onSuccess?: () => void;
}

export function PayoutRequestForm({ availableEarnings, onSuccess }: PayoutRequestFormProps) {
  const [amount, setAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const maxAmount = availableEarnings / 100; // Convert cents to euros

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum > maxAmount) {
      setError(`Maximum amount is €${maxAmount.toFixed(2)}`);
      return;
    }

    if (!paymentDetails.trim()) {
      setError('Please provide payment details');
      return;
    }

    if (!user) {
      setError('Please log in to request a payout');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/affiliates/request-payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.userId,
        },
        body: JSON.stringify({
          amount: amountNum,
          paymentDetails: paymentDetails.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payout request');
      }

      setSuccess(true);
      setAmount('');
      setPaymentDetails('');
      
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <p className="text-primary font-medium">Payout request submitted successfully!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your request is pending admin approval.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Payout</CardTitle>
        <CardDescription>
          Available: €{maxAmount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loading}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">
              Maximum: €{maxAmount.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDetails">Payment Details</Label>
            <Textarea
              id="paymentDetails"
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              required
              disabled={loading}
              placeholder="PayPal email, bank account details, etc."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Provide your payment information (PayPal email, bank account, etc.)
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading || maxAmount <= 0}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
