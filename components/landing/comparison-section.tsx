"use client";

import { Check, X } from "@phosphor-icons/react";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShineBorder } from "@/components/ui/shine-border";

const comparisonData = [
  {
    feature: "Pricing",
    subscription: "€199-€499/month forever",
    abdu: "€399 once",
    subscriptionBad: true,
  },
  {
    feature: "Total cost (Year 1)",
    subscription: "€2,388 - €5,988",
    abdu: "€399 (done)",
    subscriptionBad: true,
  },
  {
    feature: "Content access",
    subscription: "Lose when you cancel",
    abdu: "Lifetime ownership",
    subscriptionBad: true,
  },
  {
    feature: "Live trading",
    subscription: "Extra fee or not included",
    abdu: "Included",
    subscriptionBad: true,
  },
  {
    feature: "1-on-1 mentorship",
    subscription: "Upsell (€XXX/session)",
    abdu: "Included",
    subscriptionBad: true,
  },
  {
    feature: "Advanced strategies",
    subscription: '"Elite tier" upsell',
    abdu: "Everything unlocked",
    subscriptionBad: true,
  },
  {
    feature: "Future updates",
    subscription: "Only while subscribed",
    abdu: "Lifetime",
    subscriptionBad: true,
  },
  {
    feature: "Community access",
    subscription: "Lose if you cancel",
    abdu: "Lifetime membership",
    subscriptionBad: true,
  },
];

export function ComparisonSection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <BlurFade delay={0.1} inView>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm text-primary font-medium tracking-widest uppercase mb-4 block">
              The Smart Choice
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6">
              Why Pay Forever for Access You{" "}
              <span className="italic text-muted-foreground">Should Own</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              Here's what you're actually getting vs. what 'premium'
              subscriptions hold hostage.
            </p>
          </div>
        </BlurFade>

        {/* Comparison table */}
        <BlurFade delay={0.2} inView>
          <div className="max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Subscription Courses
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-foreground uppercase tracking-wider relative">
                      <div className="relative rounded-t-lg bg-primary/10 -mx-6 px-6 py-2">
                        Abdu Academy
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr
                      key={row.feature}
                      className={index % 2 === 0 ? "bg-card" : "bg-transparent"}
                    >
                      <td className="py-4 px-6 text-sm font-medium text-foreground">
                        {row.feature}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <X
                            className="h-4 w-4 text-destructive"
                            weight="bold"
                          />
                          {row.subscription}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center relative">
                        <div
                          className={`${
                            index % 2 === 0
                              ? "bg-primary/5"
                              : "bg-primary/10"
                          } -mx-6 px-6 py-4`}
                        >
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                            <Check
                              className="h-4 w-4 text-success"
                              weight="bold"
                            />
                            {row.abdu}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom highlight */}
            <div className="relative mt-8 p-6 rounded-xl bg-card border border-primary/30 overflow-hidden">
              <ShineBorder
                shineColor={["#3b82f6", "#2563eb", "#60a5fa"]}
                borderWidth={2}
              />
              <div className="relative z-10 text-center">
                <p className="text-xl font-display text-foreground mb-2">
                  Stop renting your trading education.{" "}
                  <span className="text-gradient-gold font-semibold">
                    Own it.
                  </span>
                </p>
                <p className="text-muted-foreground">
                  One payment of €399. Lifetime access. No hidden fees.
                </p>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
