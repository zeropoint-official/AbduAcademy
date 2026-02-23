import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { PainSection } from '@/components/landing/pain-section';
import { DifferenceSection } from '@/components/landing/difference-section';
import { OutcomesSection } from '@/components/landing/outcomes-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { FinalCtaSection } from '@/components/landing/final-cta-section';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <PainSection />
        <DifferenceSection />
        <OutcomesSection />
        <Suspense fallback={
          <section className="py-20 lg:py-28">
            <div className="container mx-auto px-6 text-center text-muted-foreground">Loading...</div>
          </section>
        }>
          <PricingSection />
        </Suspense>
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}
