"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChartLineUp,
  Brain,
  VideoCamera,
  UserCircle,
  Toolbox,
  CaretDown,
  CheckCircle,
  ArrowRight,
  Play,
  Clock,
} from "@phosphor-icons/react";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShineBorder } from "@/components/ui/shine-border";
import { BorderBeam } from "@/components/ui/border-beam";
import { motion, AnimatePresence } from "motion/react";

const modules = [
  {
    icon: ChartLineUp,
    title: "Trading Fundamentals & Strategy",
    lessons: 5,
    duration: "1h 30m",
    items: [
      "How markets really work (not textbook theory)",
      "The 3 high-probability setups Abdu Academy uses",
      "Entry/exit rules and position sizing",
      "Risk management that protects your capital",
      "Chart reading and pattern recognition",
    ],
  },
  {
    icon: Brain,
    title: "Psychology & Mindset Mastery",
    lessons: 4,
    duration: "1h 15m",
    items: [
      "Why 90% of traders fail (and how to be in the 10%)",
      "Overcoming fear, greed, and revenge trading",
      "Building a winning routine",
      "Journaling and self-assessment",
      "Handling drawdowns without blowing up",
    ],
  },
  {
    icon: VideoCamera,
    title: "Live Trading & Real-Time Learning",
    lessons: 6,
    duration: "2h 00m",
    items: [
      "Watch real trades unfold with live commentary",
      "See how setups develop in real market conditions",
      "Learn risk management in action",
      "Market context and adaptation",
      "Trading session recordings library",
    ],
  },
  {
    icon: UserCircle,
    title: "1-on-1 Mentorship & Personalized Feedback",
    lessons: 3,
    duration: "Ongoing",
    items: [
      "Submit your trades for review",
      "Get personalized feedback on your psychology and execution",
      "Identify and fix your specific weaknesses",
      "Accountability check-ins",
      "Custom action plans",
    ],
  },
  {
    icon: Toolbox,
    title: "Tools, Resources & Community",
    lessons: 4,
    duration: "45m",
    items: [
      "Trading journal templates",
      "Setup checklists",
      "Mindset exercises",
      "Private community access",
      "Weekly Q&A sessions",
    ],
  },
];

const bonuses = [
  "Lifetime access to all content",
  "All future updates and new modules (free)",
  "Lifetime community membership",
  "Downloadable resources and checklists",
  "Priority support",
];

export function CurriculumSection() {
  const [openModule, setOpenModule] = useState<number | null>(0);

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <BlurFade delay={0.1} inView>
          <div className="max-w-3xl mb-16">
            <span className="text-sm text-primary font-medium tracking-widest uppercase mb-4 block">
              Complete Curriculum
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6">
              The Complete Trading System:{" "}
              <span className="italic text-muted-foreground">
                Everything You Need in One Place
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              No upsells. No 'elite tiers'. No hidden modules. This is
              everything.
            </p>
          </div>
        </BlurFade>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Modules accordion */}
          <div className="lg:col-span-2">
            <BlurFade delay={0.2} inView>
              <div className="space-y-4">
                {modules.map((module, index) => (
                  <div
                    key={module.title}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setOpenModule(openModule === index ? null : index)
                      }
                      className="w-full flex items-center gap-4 p-6 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <module.icon
                          className="h-6 w-6 text-primary"
                          weight="duotone"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">
                          {module.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Play className="h-3.5 w-3.5" weight="fill" />
                            {module.lessons} lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {module.duration}
                          </span>
                        </div>
                      </div>
                      <CaretDown
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          openModule === index ? "rotate-180" : ""
                        }`}
                        weight="bold"
                      />
                    </button>

                    <AnimatePresence>
                      {openModule === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-2 border-t border-border">
                            <ul className="space-y-3">
                              {module.items.map((item, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-3 text-sm text-muted-foreground"
                                >
                                  <CheckCircle
                                    className="h-4 w-4 text-primary flex-shrink-0 mt-0.5"
                                    weight="fill"
                                  />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </BlurFade>

            {/* Bonuses */}
            <BlurFade delay={0.4} inView>
              <div className="mt-8 p-6 bg-card border border-border rounded-xl">
                <h4 className="font-semibold text-foreground mb-4">
                  Plus, You Also Get:
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {bonuses.map((bonus, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle
                        className="h-4 w-4 text-success flex-shrink-0"
                        weight="fill"
                      />
                      {bonus}
                    </div>
                  ))}
                </div>
              </div>
            </BlurFade>
          </div>

          {/* Value stack */}
          <div className="lg:col-span-1">
            <BlurFade delay={0.3} inView>
              <div className="sticky top-24">
                <div className="p-8 bg-card rounded-xl relative overflow-hidden border border-primary/30">
                    <ShineBorder
                      shineColor={["#3b82f6", "#2563eb", "#60a5fa"]}
                      borderWidth={2}
                    />
                    <BorderBeam
                      size={150}
                      duration={10}
                      colorFrom="#3b82f6"
                      colorTo="#2563eb"
                    />

                    <div className="relative z-10">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
                        Limited Offer
                      </span>

                      <h4 className="text-lg font-semibold text-foreground mb-6">
                        Complete Trading System
                      </h4>

                      {/* Value items */}
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Full Course Access
                          </span>
                          <span className="text-foreground">€997</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Live Trading Sessions
                          </span>
                          <span className="text-foreground">€497</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            1-on-1 Mentorship
                          </span>
                          <span className="text-foreground">€997</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Lifetime Community
                          </span>
                          <span className="text-foreground">€297</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Resources & Updates
                          </span>
                          <span className="text-foreground">€197</span>
                        </div>
                      </div>

                      <div className="h-px bg-border mb-6" />

                      {/* Total value */}
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">
                          Total Value:
                        </span>
                        <span className="text-foreground line-through">
                          €2,985
                        </span>
                      </div>

                      {/* Your price */}
                      <div className="flex justify-between items-baseline mb-6">
                        <span className="text-lg font-medium text-foreground">
                          Your Investment:
                        </span>
                        <div className="text-right">
                          <span className="text-4xl font-bold text-primary">
                            €400
                          </span>
                          <span className="text-sm text-muted-foreground block">
                            one time
                          </span>
                        </div>
                      </div>

                      {/* Savings */}
                      <div className="p-3 bg-success/10 border border-success/20 rounded-lg mb-6 text-center">
                        <span className="text-success font-semibold">
                          You Save: €2,585+
                        </span>
                        <span className="text-sm text-muted-foreground block">
                          vs. subscriptions
                        </span>
                      </div>

                      {/* CTA */}
                      <Link
                        href="/payment"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors glow-gold"
                      >
                        Get Lifetime Access Now
                        <ArrowRight className="h-5 w-5" weight="bold" />
                      </Link>
                    </div>
                  </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </div>
    </section>
  );
}
