'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { PayoutRequestsTable } from '@/components/admin/payout-requests-table';
import { getCurrentUser } from '@/lib/appwrite/auth';
import type { User } from '@/lib/appwrite/auth';

interface Affiliate {
  affiliateId: string;
  code: string;
  userId: string;
  userEmail: string;
  userName: string;
  totalEarnings: number;
  totalReferrals: number;
  pendingEarnings: number;
  paidEarnings: number;
  isActive: boolean;
  createdAt: string;
  referralCount: number;
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function init() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        loadAffiliates(currentUser.userId);
      }
    }
    init();
  }, []);

  async function loadAffiliates(userId: string) {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/affiliates', {
        headers: {
          'x-user-id': userId,
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to load affiliates');
      }
      const data = await response.json();
      setAffiliates(data.affiliates || []);
    } catch (error: any) {
      console.error('Error loading affiliates:', error);
      setAffiliates([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Affiliates</h1>
        <p className="text-muted-foreground">Manage affiliates and payout requests</p>
      </div>

      <Tabs defaultValue="payouts" className="w-full">
        <TabsList>
          <TabsTrigger value="payouts">Payout Requests</TabsTrigger>
          <TabsTrigger value="all">All Affiliates</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="mt-6">
          <PayoutRequestsTable />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Affiliates ({affiliates.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground text-center py-8">Loading...</div>
              ) : affiliates.length === 0 ? (
                <div className="text-muted-foreground text-center py-8">
                  No affiliates found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Referrals</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Paid Out</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliates.map((affiliate) => (
                      <TableRow key={affiliate.affiliateId}>
                        <TableCell className="font-mono font-medium">
                          {affiliate.code}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{affiliate.userName}</div>
                            <div className="text-xs text-muted-foreground">
                              {affiliate.userEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          €{(affiliate.totalEarnings / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>{affiliate.totalReferrals}</TableCell>
                        <TableCell className="text-warning">
                          €{(affiliate.pendingEarnings / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-success">
                          €{(affiliate.paidEarnings / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={affiliate.isActive ? 'default' : 'secondary'}>
                            {affiliate.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
