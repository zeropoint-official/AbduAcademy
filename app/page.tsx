'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/early-access/pricing-card';
import { CheckCircle, Play, Pause } from '@phosphor-icons/react';
import Link from 'next/link';

function EarlyAccessContent() {
  const searchParams = useSearchParams();
  const [showThankYou, setShowThankYou] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check for success parameter
    if (searchParams.get('success') === 'true') {
      setShowThankYou(true);
      // Remove success param from URL without reload
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoClick = () => {
    togglePlay();
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setShowControls(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated gradient glows */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
          <div className="absolute top-1/3 left-10 w-[350px] h-[350px] bg-primary/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
        </div>
      </div>

      <div className="relative z-10">
        {/* Thank You Modal */}
        {showThankYou && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="text-center">
                <div className="mb-4">
                  <CheckCircle className="h-16 w-16 text-primary mx-auto" weight="fill" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-2">Thank You!</h2>
                <p className="text-muted-foreground mb-6">
                  Your payment has been processed successfully. You'll receive an email confirmation shortly.
                </p>
                <Button
                  onClick={() => setShowThankYou(false)}
                  className="w-full"
                  size="lg"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 md:mb-16">
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Early Access Offer
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Secure your spot now with a €19 deposit. Pay the remaining €180 next week.
              </p>
            </div>

            {/* Video Section */}
            <div className="mb-12 md:mb-16">
              <div className="relative w-full max-w-2xl mx-auto">
                {/* Video Container with glow effect */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-border/50 bg-black/50 backdrop-blur-sm">
                  {/* Decorative glow behind video */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 rounded-2xl blur-xl opacity-50" />
                  
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full aspect-video object-contain cursor-pointer bg-black"
                      onClick={handleVideoClick}
                      onEnded={handleVideoEnd}
                      onPlay={() => { setIsPlaying(true); setShowControls(false); }}
                      onPause={() => { setIsPlaying(false); setShowControls(true); }}
                      playsInline
                      preload="metadata"
                    >
                      <source src="https://pub-c16cfda790dc4841b59ca23daaa41898.r2.dev/videos/Timeline%203.mov" type="video/quicktime" />
                      <source src="https://pub-c16cfda790dc4841b59ca23daaa41898.r2.dev/videos/Timeline%203.mov" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Play/Pause Overlay */}
                    <div 
                      className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 cursor-pointer ${
                        showControls || !isPlaying ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                      }`}
                      onClick={handleVideoClick}
                    >
                      <div className={`transform transition-all duration-300 ${isPlaying ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform">
                          <Play className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground ml-1" weight="fill" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Caption */}
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Watch: What you'll learn in the course
                </p>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="mb-12">
              <PricingCard />
            </div>

            {/* Additional Info */}
            <div className="text-center space-y-4 mb-12">
              <div className="text-sm text-muted-foreground">
                <p>Secure payment powered by Stripe</p>
                <p className="mt-2">Questions? Contact us at support@abduacademy.com</p>
              </div>
            </div>

            {/* Admin Login Links (Minimal, at bottom) */}
            <div className="mt-16 pt-8 border-t border-border">
              <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Admin Login
                </Link>
                <span>•</span>
                <Link href="/register" className="hover:text-foreground transition-colors">
                  Register
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function EarlyAccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <EarlyAccessContent />
    </Suspense>
  );
}
