'use client';

import { useState } from 'react';
import { Copy, Check } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AffiliateCodeDisplayProps {
  code: string;
}

export function AffiliateCodeDisplay({ code }: AffiliateCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const shareUrl = `${window.location.origin}/payment?ref=${code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/payment?ref=${code}`
    : '';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Your Affiliate Code
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-2 bg-muted rounded font-mono text-lg font-semibold">
                {code}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                title="Copy share link"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-primary" weight="bold" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Share Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-4 py-2 bg-muted rounded text-sm font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
