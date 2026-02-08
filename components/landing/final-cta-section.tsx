"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Lightning,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ShineBorder } from "@/components/ui/shine-border";

export function FinalCtaSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">

      <div className="container mx-auto px-6 relative z-10">
        <BlurFade delay={0.1} inView>
          <div className="max-w-4xl mx-auto text-center">
            {/* Headline */}
            <span className="text-sm text-primary font-medium tracking-widest uppercase mb-6 block">
              Ready to Transform Your Trading?
            </span>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6">
              Stop Renting Your Trading Education.{" "}
              <span className="text-gradient-gold">Own It Today.</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join 500+ traders who invested once and are building consistent
              profits. No monthly fees. No upsells. Just the complete system,
              lifetime access, and the mentorship you need to win.
            </p>

            {/* Pricing card */}
            <div className="relative max-w-md mx-auto mb-10 p-8 bg-card border border-border rounded-xl overflow-hidden">
              <ShineBorder
                shineColor={["#3b82f6", "#2563eb", "#60a5fa"]}
                borderWidth={2}
              />

              <div className="relative z-10">
                {/* Price comparison */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground line-through">
                      €200/month forever
                    </p>
                    <p className="text-xs text-muted-foreground">
                      (€2,400/year)
                    </p>
                  </div>
                  <div className="text-2xl text-muted-foreground">→</div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">€399</p>
                    <p className="text-sm text-muted-foreground">once</p>
                  </div>
                </div>

                {/* Alternative framing */}
                <p className="text-sm text-muted-foreground mb-6">
                  Less than 2 months of a 'premium' subscription—but yours for
                  life
                </p>

                {/* CTA button */}
                <Link href="/course" className="block">
                  <ShimmerButton
                    shimmerColor="#3b82f6"
                    shimmerSize="0.1em"
                    background="linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                    borderRadius="8px"
                    className="w-full h-16 text-lg font-semibold gap-3"
                  >
                    Get Lifetime Access Now
                    <ArrowRight className="h-6 w-6" weight="bold" />
                  </ShimmerButton>
                </Link>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-5 w-5 text-success" weight="fill" />
                Secure checkout
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lightning className="h-5 w-5 text-primary" weight="fill" />
                Instant access
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-success" weight="fill" />
                30-day guarantee
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-5 w-5 text-primary" weight="fill" />
                Lifetime support
              </span>
            </div>

            {/* Optional urgency */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-foreground">
                <strong className="text-primary">127 traders</strong> enrolled
                this week
              </span>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
