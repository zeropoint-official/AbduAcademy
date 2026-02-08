'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Payment {
  paymentId: string;
  userId: string;
  amount: number;
  discountAmount: number;
  status: string;
  affiliateCode?: string | null;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        loadPayments(currentUser.userId);
      }
    }
    init();
  }, []);

  async function loadPayments(userId: string) {
    try {
      const response = await fetch('/api/admin/payments', {
        headers: {
          'x-user-id': userId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load payments');
      }

      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
      refunded: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredPayments = payments.filter((payment) =>
    filter
      ? payment.paymentId.toLowerCase().includes(filter.toLowerCase()) ||
        payment.userId.toLowerCase().includes(filter.toLowerCase()) ||
        payment.affiliateCode?.toLowerCase().includes(filter.toLowerCase())
      : true
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Payments</h1>
        <p className="text-muted-foreground">View and manage all payments</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Payments</CardTitle>
            <Input
              placeholder="Search payments..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground text-center py-8">Loading...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              No payments found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Affiliate Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.paymentId}>
                    <TableCell className="font-mono text-sm">
                      {payment.paymentId.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.userId.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">
                      €{(payment.amount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {payment.discountAmount > 0
                        ? `-€${(payment.discountAmount / 100).toFixed(2)}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {payment.affiliateCode ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {payment.affiliateCode}
                        </code>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
