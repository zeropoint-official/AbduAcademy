"use client";

import Link from "next/link";
import {
  ChartLineUp,
  Brain,
  VideoCamera,
  UsersThree,
  ArrowRight,
  CheckCircle,
  TrendUp,
  CurrencyCircleDollar,
} from "@phosphor-icons/react";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";

const outcomes = [
  {
    icon: ChartLineUp,
    title: "High-Probability Setups You Can Trade Monday",
    description:
      "Learn the exact entry/exit criteria, risk management, and position sizing. No 'it depends'—just clear rules.",
    benefits: [
      "3 proven trading setups",
      "Clear entry & exit rules",
      "Risk management framework",
    ],
    gradient: "from-blue-500/20 to-blue-600/10",
  },
  {
    icon: Brain,
    title: "The Mindset to Stay Disciplined When It Matters",
    description:
      "Overcome revenge trading, FOMO, and fear. Master the psychology that separates pros from gamblers.",
    benefits: [
      "Emotional control techniques",
      "Trading journal system",
      "Handling drawdowns",
    ],
    gradient: "from-purple-500/20 to-purple-600/10",
  },
  {
    icon: VideoCamera,
    title: "Live Trading Observation + Feedback",
    description:
      "Watch real trades as they happen. Submit your trades for 1-on-1 review. Learn from real market conditions.",
    benefits: [
      "Real-time trade analysis",
      "Personalized feedback",
      "Market context training",
    ],
    gradient: "from-green-500/20 to-green-600/10",
  },
  {
    icon: CurrencyCircleDollar,
    title: "Lifetime Support & Community",
    description:
      "Get your questions answered. Share setups. Learn from other successful traders—forever, not just while you're subscribed.",
    benefits: [
      "Private community access",
      "Weekly Q&A sessions",
      "Lifetime updates",
    ],
    gradient: "from-amber-500/20 to-amber-600/10",
  },
];

export function OutcomesSection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <BlurFade delay={0.1} inView>
          <div className="max-w-3xl mb-16">
            <span className="text-sm text-primary font-medium tracking-widest uppercase mb-4 block">
              What You'll Master
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6">
              What You'll Master{" "}
              <span className="italic text-muted-foreground">
                (And Why It Actually Works)
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Not theory. Not indicators. Real setups, real psychology, real
              support.
            </p>
          </div>
        </BlurFade>

        {/* Outcome cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {outcomes.map((outcome, index) => (
            <BlurFade key={outcome.title} delay={0.2 + index * 0.1} inView>
              <MagicCard
                gradientColor="#3b82f6"
                gradientOpacity={0.15}
                gradientFrom="#3b82f6"
                gradientTo="#2563eb"
                className="h-full rounded-xl relative overflow-hidden group"
              >
                {/* Trading-themed card background pattern */}
                <div className={`absolute inset-0 bg-gradient-to-br ${outcome.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
                
                {/* Subtle chart pattern overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-300">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d="M0,80 Q25,60 50,70 T100,65"
                      stroke="#60a5fa"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <circle cx="20" cy="75" r="1.5" fill="#60a5fa" />
                    <circle cx="50" cy="70" r="1.5" fill="#60a5fa" />
                    <circle cx="80" cy="68" r="1.5" fill="#60a5fa" />
                  </svg>
                </div>

                <div className="p-8 h-full relative z-10">
                  {/* Icon with trading theme */}
                  <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center group-hover:border-primary/50 transition-all duration-300 group-hover:scale-110">
                      <outcome.icon
                        className="h-8 w-8 text-primary"
                        weight="duotone"
                      />
                    </div>
                    {/* Small accent dot */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-xl text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors duration-300">
                    {outcome.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {outcome.description}
                  </p>

                  {/* Benefits list with trading checkmarks */}
                  <ul className="space-y-3">
                    {outcome.benefits.map((benefit, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm text-muted-foreground group-hover/item:text-foreground transition-colors duration-300"
                      >
                        <div className="relative flex-shrink-0">
                          <CheckCircle
                            className="h-5 w-5 text-primary"
                            weight="fill"
                          />
                          <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm" />
                        </div>
                        <span className="relative">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </MagicCard>
            </BlurFade>
          ))}
        </div>

        {/* CTA block */}
        <BlurFade delay={0.6} inView>
          <div className="text-center p-8 bg-card border border-border rounded-xl max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Ready to Master These Skills?
            </h3>
            <Link
              href="/payment"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors glow-gold-sm"
            >
              Get Lifetime Access – One Payment
              <ArrowRight className="h-5 w-5" weight="bold" />
            </Link>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" weight="fill" />
                Instant access
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" weight="fill" />
                All modules unlocked
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" weight="fill" />
                Lifetime updates
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" weight="fill" />
                1-on-1 mentorship
              </span>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
