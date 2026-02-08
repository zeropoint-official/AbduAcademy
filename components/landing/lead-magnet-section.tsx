"use client";

import { useState } from "react";
import { PaperPlaneTilt, Gift, CheckCircle } from "@phosphor-icons/react";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShineBorder } from "@/components/ui/shine-border";

export function LeadMagnetSection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    setIsSubmitted(true);
  };

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden">

      <div className="container mx-auto px-6 relative z-10">
        <BlurFade delay={0.1} inView>
          <div className="max-w-3xl mx-auto relative">
            <div className="p-8 md:p-12 bg-card rounded-xl text-center border border-primary/30 relative overflow-hidden">
              <ShineBorder
                shineColor={["#3b82f6", "#2563eb", "#60a5fa"]}
                borderWidth={2}
              />
              {/* Icon */}
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                <Gift className="h-8 w-8 text-primary" weight="duotone" />
              </div>

              {/* Content */}
              <h3 className="font-display text-2xl md:text-3xl tracking-tight text-foreground mb-4">
                Get My Free 'Subscription vs. One-Time'{" "}
                <span className="text-gradient-gold">Cost Calculator</span>
                <br />+ 3 Winning Setups
              </h3>

              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                See exactly how much you'll waste on subscriptions over 1, 3,
                and 5 years—plus get 3 high-probability setups you can start
                using this week.
              </p>

              {!isSubmitted ? (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 glow-gold-sm"
                  >
                    Get Free Calculator
                    <PaperPlaneTilt className="h-5 w-5" weight="bold" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 text-success">
                  <CheckCircle className="h-6 w-6" weight="fill" />
                  <span className="font-medium">
                    Check your email for the calculator!
                  </span>
                </div>
              )}

              {/* Trust line */}
              <p className="text-xs text-muted-foreground mt-6">
                Join 500+ traders. Unsubscribe anytime. No spam, no upsells.
              </p>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
