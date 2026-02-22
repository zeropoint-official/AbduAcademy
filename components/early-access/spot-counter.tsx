'use client';

import { useEffect, useState, useRef } from 'react';

interface SpotCount {
  sold: number;
  remaining: number;
  total: number;
}

interface SpotCounterProps {
  className?: string;
}

export function SpotCounter({ className }: SpotCounterProps) {
  const [count, setCount] = useState<SpotCount>({ sold: 10, remaining: 20, total: 30 });
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(false);
  const previousCountRef = useRef(0);

  useEffect(() => {
    // Initial load
    async function initialLoad() {
      await loadCount();
      // Set previous count after initial load
      const response = await fetch('/api/early-access/count');
      if (response.ok) {
        const data = await response.json();
        previousCountRef.current = data.sold;
      }
    }
    
    initialLoad();

    // Poll for updates every 10 seconds
    // Reduced frequency to avoid excessive API calls while still providing reasonable updates
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/early-access/count');
        if (response.ok) {
          const data = await response.json();
          
          // Check if count increased (new payment)
          if (data.sold > previousCountRef.current) {
            setPulse(true);
            setTimeout(() => setPulse(false), 1000);
            previousCountRef.current = data.sold;
          }
          
          setCount(data);
          
          // Dispatch custom event so other components can listen
          window.dispatchEvent(new CustomEvent('spotCountUpdate', { detail: data }));
        }
      } catch (error) {
        console.error('Error polling spot count:', error);
      }
    }, 10000); // Poll every 10 seconds (much more reasonable)

    // Cleanup interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  async function loadCount() {
    try {
      const response = await fetch('/api/early-access/count');
      if (response.ok) {
        const data = await response.json();
        setCount(data);
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('spotCountUpdate', { detail: data }));
      }
    } catch (error) {
      console.error('Error loading spot count:', error);
    } finally {
      setLoading(false);
    }
  }

  const isSoldOut = count.remaining === 0;
  const percentage = (count.sold / count.total) * 100;

  return (
    <div className={className}>
      <div className={`relative ${pulse ? 'animate-pulse' : ''}`}>
        {/* Main counter display */}
        <div className="text-center mb-4">
          <div className="text-5xl md:text-7xl font-display font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {loading ? '...' : count.remaining}
          </div>
          <div className="text-lg md:text-xl text-muted-foreground">
            {isSoldOut ? 'Spots Sold Out!' : 'Spots Remaining'}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Stats */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{count.sold} sold</span>
          <span>{count.total} total</span>
        </div>

        {/* Urgency indicator */}
        {!isSoldOut && count.remaining <= 5 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-full text-sm font-medium animate-pulse">
              <span>⚡</span>
              <span>Only {count.remaining} left!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
