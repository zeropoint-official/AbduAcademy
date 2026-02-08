"use client";

import {
  WarningCircle,
  CurrencyCircleDollar,
  ArrowsClockwise,
  UserMinus,
  TrendDown,
  Brain,
  Fire,
  Target,
  Trash,
  ArrowRight,
} from "@phosphor-icons/react";
import { BlurFade } from "@/components/ui/blur-fade";

const tradingBlindPains = [
  {
    icon: TrendDown,
    text: "Blown accounts from guessing",
  },
  {
    icon: WarningCircle,
    text: "No risk management",
  },
  {
    icon: Brain,
    text: "Emotional decisions",
  },
  {
    icon: Fire,
    text: "Revenge trading",
  },
  {
    icon: Target,
    text: "No edge, just hope",
  },
];

const subscriptionPains = [
  {
    icon: CurrencyCircleDollar,
    text: "€199-€499/month forever",
  },
  {
    icon: ArrowsClockwise,
    text: "Basic content recycled monthly",
  },
  {
    icon: UserMinus,
    text: "No personalized guidance",
  },
  {
    icon: TrendDown,
    text: "Upsells to 'elite' tiers",
  },
  {
    icon: Trash,
    text: "Cancel and lose everything",
  },
];

export function PainSection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <BlurFade delay={0.1} inView>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm text-primary font-medium tracking-widest uppercase mb-4 block">
              The Problem
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6">
              You've Already Wasted Enough Money on{" "}
              <span className="italic text-muted-foreground">
                Trading Education
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Most traders lose money in two ways: trading without knowledge, or
              spending thousands on 'premium' subscriptions that recycle the
              same basic indicators everyone else teaches.
            </p>
          </div>
        </BlurFade>

        {/* Two-column pain points */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto mb-16">
          {/* Trading Blind Column */}
          <BlurFade delay={0.2} inView>
            <div className="card-elevated rounded-xl p-8 h-full border-destructive/20 hover:border-destructive/40 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                  <WarningCircle
                    className="h-6 w-6 text-destructive"
                    weight="fill"
                  />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Trading Blind
                </h3>
              </div>

              <ul className="space-y-4">
                {tradingBlindPains.map((pain, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <pain.icon
                      className="h-5 w-5 text-destructive/70 mt-0.5 flex-shrink-0"
                      weight="bold"
                    />
                    <span className="text-muted-foreground">{pain.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </BlurFade>

          {/* Subscription Trap Column */}
          <BlurFade delay={0.3} inView>
            <div className="card-elevated rounded-xl p-8 h-full border-destructive/20 hover:border-destructive/40 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                  <CurrencyCircleDollar
                    className="h-6 w-6 text-destructive"
                    weight="fill"
                  />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Subscription Trap
                </h3>
              </div>

              <ul className="space-y-4">
                {subscriptionPains.map((pain, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <pain.icon
                      className="h-5 w-5 text-destructive/70 mt-0.5 flex-shrink-0"
                      weight="bold"
                    />
                    <span className="text-muted-foreground">{pain.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </BlurFade>
        </div>

        {/* Transition to solution */}
        <BlurFade delay={0.4} inView>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-display text-foreground mb-6">
              There's a{" "}
              <span className="text-gradient-gold font-semibold">
                third way
              </span>
              :
            </p>
            <p className="text-2xl md:text-3xl font-display tracking-tight">
              Learn once. Pay once.{" "}
              <span className="italic text-muted-foreground">
                Win consistently.
              </span>
            </p>
            <a
              href="#difference"
              className="inline-flex items-center gap-2 mt-8 text-primary hover:text-primary/80 transition-colors font-medium"
            >
              See What's Included
              <ArrowRight className="h-4 w-4" weight="bold" />
            </a>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
