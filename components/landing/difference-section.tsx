"use client";

import {
  Package,
  Video,
  Infinity,
  Users,
  Clock,
  Certificate,
} from "@phosphor-icons/react";
import { BlurFade } from "@/components/ui/blur-fade";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShineBorder } from "@/components/ui/shine-border";

const differenceCards = [
  {
    icon: Package,
    title: "Complete System, Not Drip-Fed Content",
    description:
      "Get the full methodology, strategies, and mindset training immediately. No holding back content for next month's payment.",
    gradient: "from-amber-500/20 to-transparent",
  },
  {
    icon: Video,
    title: "Live Trading + 1-on-1 Mentorship Included",
    description:
      "Watch real trades unfold in real-time. Get personalized feedback on YOUR setups and psychology—not generic group coaching.",
    gradient: "from-primary/20 to-transparent",
  },
  {
    icon: Infinity,
    title: "Pay Once, Access Forever",
    description:
      "One investment. Lifetime access to all content, updates, and community. No recurring charges, no expiration, no gatekeeping.",
    gradient: "from-gold/20 to-transparent",
  },
];

const metrics = [
  { value: 500, label: "Active Traders", suffix: "+" },
  { value: 2000, label: "Avg. Saved vs Subs", prefix: "€", suffix: "" },
  { value: 20, label: "Hours of Content", suffix: "+" },
  { value: 1, label: "Mentorship Sessions", suffix: "-on-1" },
];

export function DifferenceSection() {
  return (
    <section id="difference" className="relative py-20 lg:py-28 overflow-hidden">

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <BlurFade delay={0.1} inView>
          <div className="max-w-3xl mb-16">
            <span className="text-sm text-primary font-medium tracking-widest uppercase mb-4 block">
              The Abdu Academy Difference
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6">
              One Payment. One System.{" "}
              <span className="italic text-muted-foreground">
                Lifetime Results.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to become consistently profitable—without
              monthly fees or upsells.
            </p>
          </div>
        </BlurFade>

        {/* Difference cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {differenceCards.map((card, index) => (
            <BlurFade key={card.title} delay={0.2 + index * 0.1} inView>
              <div className="h-full relative">
                <div className="card-elevated rounded-xl p-8 h-full relative overflow-hidden">
                  <ShineBorder
                    shineColor={["#3b82f6", "#2563eb", "#60a5fa"]}
                    borderWidth={1}
                  />
                  {/* Gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`}
                  />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                      <card.icon
                        className="h-7 w-7 text-primary"
                        weight="duotone"
                      />
                    </div>

                    {/* Content */}
                    <h3 className="font-semibold text-xl text-foreground mb-3 tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>

        {/* Metrics row */}
        <BlurFade delay={0.5} inView>
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className="text-center relative"
                >
                  <div className="flex items-baseline justify-center gap-0.5 mb-2">
                    {metric.prefix && (
                      <span className="font-mono text-2xl text-primary">
                        {metric.prefix}
                      </span>
                    )}
                    <NumberTicker
                      value={metric.value}
                      className="font-mono text-4xl md:text-5xl font-bold text-foreground"
                    />
                    <span className="font-mono text-2xl text-primary">
                      {metric.suffix}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">
                    {metric.label}
                  </p>
                  {index < metrics.length - 1 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-12 w-px bg-border hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
