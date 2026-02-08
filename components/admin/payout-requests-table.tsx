'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PayoutApprovalForm } from './payout-approval-form';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';

interface PayoutRequest {
  payoutId: string;
  affiliateId: string;
  affiliateCode?: string;
  affiliateName?: string;
  affiliateEmail?: string;
  requestedBy: string;
  buyerName?: string;
  buyerEmail?: string;
  amount: number;
  status: string;
  paymentDetails: string;
  requestedAt: string;
  referralId?: string | null;
  approvedAt?: string | null;
  completedAt?: string | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;
}

export function PayoutRequestsTable() {
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        loadRequests(currentUser.userId);
      }
    }
    init();
  }, []);

  async function loadRequests(userId: string) {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payouts', {
        headers: {
          'x-user-id': userId,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to load payout requests');
      }
      const data = await response.json();
      setRequests(data.payouts || []);
    } catch (error: any) {
      console.error('Error loading payout requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      requested: 'secondary',
      approved: 'default',
      completed: 'default',
      rejected: 'destructive',
      failed: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const pendingRequests = requests.filter((r) => r.status === 'requested');

  return (
    <div className="space-y-6">
      {selectedRequest ? (
        <PayoutApprovalForm
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSuccess={() => {
            setSelectedRequest(null);
            if (user) {
              loadRequests(user.userId);
            }
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Payout Requests ({pendingRequests.length} pending)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground text-center py-8">Loading...</div>
            ) : requests.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                No payout requests found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Referred By</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Details</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.payoutId}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{request.affiliateName || request.affiliateEmail || 'N/A'}</div>
                          {request.affiliateCode && (
                            <div className="text-xs text-muted-foreground">
                              Code: {request.affiliateCode}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{request.buyerName || request.buyerEmail || 'N/A'}</div>
                          {request.buyerEmail && request.buyerName && (
                            <div className="text-xs text-muted-foreground">
                              {request.buyerEmail}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>€{(request.amount / 100).toFixed(2)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {request.paymentDetails}
                      </TableCell>
                      <TableCell>
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {request.status === 'requested' && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            Review
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
