'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';
import { AffiliateCodeDisplay } from './affiliate-code-display';
import { PayoutRequestForm } from './payout-request-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AffiliateStats {
  code: string;
  totalEarnings: number;
  totalReferrals: number;
  pendingEarnings: number;
  paidEarnings: number;
  availableEarnings: number;
  isActive: boolean;
}

interface Referral {
  referralId: string;
  earnings: number;
  status: string;
  createdAt: string;
  paidAt?: string;
  payoutRequested?: boolean;
}

export function AffiliateDashboard() {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        loadStats(currentUser.userId);
      }
    }
    init();
  }, []);

  async function loadStats(userId: string) {
    try {
      const response = await fetch('/api/affiliates/stats', {
        headers: {
          'x-user-id': userId,
        },
      });
      const data = await response.json();

      if (data.hasAffiliate) {
        setStats(data.affiliate);
        setReferrals(data.referrals || []);
      }
    } catch (error) {
      console.error('Error loading affiliate stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      paid: 'default',
      cancelled: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You don't have an affiliate code yet.</p>
            <Button onClick={createAffiliateCode}>Create Affiliate Code</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  async function createAffiliateCode() {
    if (!user) {
      alert('Please log in to create an affiliate code');
      return;
    }

    try {
      const response = await fetch('/api/affiliates/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.userId,
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        loadStats(user.userId);
      } else {
        alert(data.error || 'Failed to create affiliate code');
      }
    } catch (error) {
      alert('Failed to create affiliate code');
    }
  }

  async function handleRequestPayoutForReferral(referralId: string) {
    if (!user) {
      alert('Please log in to request a payout');
      return;
    }

    if (!confirm('Request €50 payout for this referral? You will need to provide payment details.')) {
      return;
    }

    const paymentDetails = prompt('Enter your payment details (PayPal email, bank account, etc.):');
    if (!paymentDetails || !paymentDetails.trim()) {
      alert('Payment details are required');
      return;
    }

    try {
      const response = await fetch('/api/affiliates/request-payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.userId,
        },
        body: JSON.stringify({
          amount: 50, // €50 per referral
          paymentDetails: paymentDetails.trim(),
          referralId, // Include referral ID to link payout to specific referral
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Payout request submitted successfully!');
        loadStats(user.userId);
      } else {
        alert(data.error || 'Failed to create payout request');
      }
    } catch (error) {
      alert('Failed to create payout request');
    }
  }

  return (
    <div className="space-y-6">
      <AffiliateCodeDisplay code={stats.code} />

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{(stats.totalEarnings / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              €{(stats.availableEarnings / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{(stats.paidEarnings / 100).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="referrals" className="w-full">
        <TabsList>
          <TabsTrigger value="referrals">Referral History</TabsTrigger>
          <TabsTrigger value="payout">Request Payout</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No referrals yet. Share your affiliate code to start earning!
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.referralId}>
                        <TableCell>
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          €{(referral.earnings / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(referral.status)}</TableCell>
                        <TableCell className="text-right">
                          {referral.status === 'pending' && !referral.payoutRequested && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestPayoutForReferral(referral.referralId)}
                            >
                              Request €50 Payout
                            </Button>
                          )}
                          {referral.status === 'paid' && (
                            <span className="text-xs text-muted-foreground">Paid</span>
                          )}
                          {referral.payoutRequested && referral.status === 'pending' && (
                            <span className="text-xs text-muted-foreground">Requested</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payout" className="space-y-4">
          {stats.availableEarnings > 0 ? (
            <PayoutRequestForm
              availableEarnings={stats.availableEarnings}
              onSuccess={() => {
                setShowPayoutForm(false);
                if (user) {
                  loadStats(user.userId);
                }
              }}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center py-8">
                  You don't have any available earnings to request.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
