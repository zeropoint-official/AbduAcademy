"use client";

import { useState } from "react";
import { CaretDown, Question } from "@phosphor-icons/react";
import { BlurFade } from "@/components/ui/blur-fade";
import { motion, AnimatePresence } from "motion/react";

const faqs = [
  {
    question: "Why one payment instead of monthly?",
    answer:
      "Because you should own your education, not rent it. You learn on your timeline, not ours. Subscription models are designed to keep you paying—our model is designed to get you results as fast as possible. Once you pay, you have lifetime access. No recurring charges, no pressure, no losing access if you need to take a break.",
  },
  {
    question: "What if I'm a complete beginner?",
    answer:
      "Perfect. We start from the ground up—no assumptions. The fundamentals chapter takes you from zero knowledge to understanding how forex markets actually work. Many of our most successful students started knowing absolutely nothing about trading.",
  },
  {
    question: "How is 1-on-1 mentorship structured?",
    answer:
      "You can submit your trades (screenshots, journal entries, questions) for personalized review. Abdu will analyze your specific mistakes, identify patterns in your trading psychology, and give you actionable feedback. This isn't generic group coaching—it's tailored to YOUR trading.",
  },
  {
    question: "What if I don't have time to go through everything immediately?",
    answer:
      "No problem. You have lifetime access. Learn at your own pace. Many students take 3-6 months to complete the full curriculum while working full-time. Unlike subscriptions that pressure you to consume content before your access expires, you own this forever.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes. We offer a 30-day money-back guarantee. Go through the content, submit trades for review, join the community. If you don't see the value within 30 days, email us and we'll refund every penny—no questions asked. We're confident you'll stay.",
  },
  {
    question: "How is this different from free YouTube content?",
    answer:
      "YouTube is scattered and incomplete by design—creators need you to keep watching more videos. This is a structured system with personalized support. You get the complete methodology, live trading examples, 1-on-1 feedback on YOUR trades, and a community of traders at every level. YouTube can't give you that.",
  },
  {
    question: "Is this suitable for day trading, swing trading, or both?",
    answer:
      "Both. The strategies and psychology principles work across timeframes. We cover scalping, day trading, swing trading, and position trading approaches. You'll learn which style fits your personality and lifestyle, then master the setups for that approach.",
  },
  {
    question: "What if the strategies stop working?",
    answer:
      "We teach you how to read markets, not just follow signals. You'll understand WHY setups work, so you can adapt to changing market conditions. Plus, you get lifetime updates—as we refine strategies or add new content, you get access for free.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <BlurFade delay={0.1} inView>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm text-primary font-medium tracking-widest uppercase mb-4 block">
              Got Questions?
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6">
              Your Questions,{" "}
              <span className="italic text-muted-foreground">Answered</span>
            </h2>
          </div>
        </BlurFade>

        {/* FAQ accordion */}
        <BlurFade delay={0.2} inView>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full flex items-start gap-4 p-6 text-left hover:bg-muted/50 transition-colors"
                >
                  <Question
                    className="h-6 w-6 text-primary flex-shrink-0 mt-0.5"
                    weight="duotone"
                  />
                  <span className="flex-1 font-medium text-foreground">
                    {faq.question}
                  </span>
                  <CaretDown
                    className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    weight="bold"
                  />
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pl-16">
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
