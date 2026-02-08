"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Particles } from "@/components/ui/particles";
import {
  HeroSection,
  PainSection,
  DifferenceSection,
  FounderSection,
  OutcomesSection,
  ComparisonSection,
  LeadMagnetSection,
  CurriculumSection,
  TestimonialsSection,
  FaqSection,
  FinalCtaSection,
} from "@/components/landing";

export default function OldLandingPage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Shared background across all sections */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Vibrant background glows */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large animated glow - top center */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[100px] animate-pulse" />
          {/* Medium glow - right side */}
          <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-blue-400/25 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
          {/* Small glow - left side */}
          <div className="absolute bottom-1/3 left-10 w-[350px] h-[350px] bg-blue-600/20 rounded-full blur-[70px] animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
        </div>

        {/* Particles background */}
        <Particles
          className="absolute inset-0"
          quantity={50}
          staticity={50}
          color="#60a5fa"
          ease={50}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-grid opacity-50" />
      </div>

      <div className="relative z-10">
        <Header />

      {/* Section 1: Hero - Above the Fold */}
      <HeroSection />

      {/* Section 2: Pain Amplification - Trading Blind vs Subscription Trap */}
      <PainSection />

      {/* Section 3: The Abdu Academy Difference */}
      <DifferenceSection />

      {/* Section 4: Founder Story */}
      <FounderSection />

      {/* Section 5: What You'll Master (Outcomes) */}
      <OutcomesSection />

      {/* Section 6: Comparison Table */}
      <ComparisonSection />

      {/* Section 7: Lead Magnet / Email Capture */}
      <LeadMagnetSection />

      {/* Section 8: Curriculum with Value Stack */}
      <CurriculumSection />

      {/* Section 9: Testimonials with Marquee */}
      <TestimonialsSection />

      {/* Section 10: FAQ Section */}
      <FaqSection />

      {/* Section 11: Final CTA */}
      <FinalCtaSection />

      {/* Footer */}
      <Footer />
      </div>
    </div>
  );
}
