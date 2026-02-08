'use client';

import { AffiliateDashboard } from '@/components/affiliates/affiliate-dashboard';

export default function AffiliatesPage() {
  return (
    <div className="min-h-screen">
      <div className="px-6 lg:px-10 py-10 lg:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">Affiliates</h1>
            <p className="text-muted-foreground">Manage your affiliate program and earnings</p>
          </div>
          <AffiliateDashboard />
        </div>
      </div>
    </div>
  );
}
