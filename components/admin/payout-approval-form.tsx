'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PayoutRequest {
  payoutId: string;
  affiliateId: string;
  requestedBy: string;
  amount: number;
  status: string;
  paymentDetails: string;
  requestedAt: string;
}

interface PayoutApprovalFormProps {
  request: PayoutRequest;
  onClose: () => void;
  onSuccess: () => void;
}

export function PayoutApprovalForm({
  request,
  onClose,
  onSuccess,
}: PayoutApprovalFormProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    if (!paymentMethod.trim()) {
      setError('Payment method is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/payouts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payoutId: request.payoutId,
          paymentMethod,
          adminNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve payout');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/payouts/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payoutId: request.payoutId,
          rejectionReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject payout');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/payouts/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payoutId: request.payoutId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete payout');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Payout Request</CardTitle>
        <CardDescription>
          Amount: €{(request.amount / 100).toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label>Payment Details</Label>
          <p className="text-sm bg-muted p-3 rounded">{request.paymentDetails}</p>
        </div>

        {request.status === 'requested' && !action && (
          <div className="flex gap-4">
            <Button onClick={() => setAction('approve')} className="flex-1">
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => setAction('reject')}
              className="flex-1"
            >
              Reject
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        )}

        {action === 'approve' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="e.g., PayPal, Bank Transfer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button onClick={handleApprove} disabled={loading} className="flex-1">
                {loading ? 'Processing...' : 'Approve & Process'}
              </Button>
              <Button variant="outline" onClick={() => setAction(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {action === 'reject' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                required
                placeholder="Explain why this payout is being rejected..."
              />
            </div>

            <div className="flex gap-4">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Reject Payout'}
              </Button>
              <Button variant="outline" onClick={() => setAction(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {request.status === 'approved' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This payout has been approved. Mark it as completed after sending the payment.
            </p>
            <div className="flex gap-4">
              <Button onClick={handleComplete} disabled={loading} className="flex-1">
                {loading ? 'Processing...' : 'Mark as Completed'}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
