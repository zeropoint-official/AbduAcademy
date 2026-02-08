"use client";

import { ShieldCheck, CheckCircle } from "@phosphor-icons/react";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShineBorder } from "@/components/ui/shine-border";

export function GuaranteeSection() {
  return (
    <section className="relative py-16 lg:py-20 bg-background">
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="container mx-auto px-6 relative z-10">
        <BlurFade delay={0.1} inView>
          <div className="max-w-3xl mx-auto relative">
            <div className="p-8 md:p-12 bg-card rounded-xl border border-success/30 relative overflow-hidden">
              <ShineBorder
                shineColor={["#22c55e", "#16a34a", "#4ade80"]}
                borderWidth={2}
              />
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Badge */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-success/10 border-4 border-success/30 flex items-center justify-center">
                      <ShieldCheck
                        className="h-16 w-16 text-success"
                        weight="fill"
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-success text-success-foreground text-xs font-bold rounded-full whitespace-nowrap">
                      30-DAY GUARANTEE
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center md:text-left">
                  <h3 className="font-display text-2xl md:text-3xl tracking-tight text-foreground mb-4">
                    30-Day Money-Back Guarantee:{" "}
                    <span className="text-gradient-gold">
                      Love It or Get a Full Refund
                    </span>
                  </h3>

                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Go through the content. Submit trades for review. Join the
                    community. If you don't see the value in 30 days, email us
                    and we'll refund every penny—no questions asked.
                  </p>

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <span className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle
                        className="h-5 w-5 text-success"
                        weight="fill"
                      />
                      No questions asked
                    </span>
                    <span className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle
                        className="h-5 w-5 text-success"
                        weight="fill"
                      />
                      Full refund
                    </span>
                    <span className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle
                        className="h-5 w-5 text-success"
                        weight="fill"
                      />
                      Zero risk
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-6 italic">
                    "You're risking nothing. We're risking our reputation."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
