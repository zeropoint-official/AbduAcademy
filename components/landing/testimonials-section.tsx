"use client";

import { Star, Quotes } from "@phosphor-icons/react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";

const testimonials = [
  {
    name: "Marcus R.",
    role: "Profitably trading after 2 months",
    avatar: "M",
    quote:
      "I spent €4,000 on a subscription course over 8 months and learned nothing. Abdu Academy's one-time course taught me more in week 1 than a year of 'premium content.' The 1-on-1 feedback alone is worth 10x the price.",
    rating: 5,
  },
  {
    name: "Sarah K.",
    role: "First profitable month",
    avatar: "S",
    quote:
      "Already see a biiiig change in my trading. After 4-5 months of struggling, everything clicked. This course has more value than paid subscriptions I've taken. The mindset training was a game-changer.",
    rating: 5,
  },
  {
    name: "David L.",
    role: "Quit 9-5 after 6 months",
    avatar: "D",
    quote:
      "The community alone is worth it. Abdu is actually active and helps everyone. Never seen anything like this in the trading education space. Best €399 I ever spent.",
    rating: 5,
  },
  {
    name: "Emily W.",
    role: "Consistent 3% monthly returns",
    avatar: "E",
    quote:
      "I was skeptical at first - how can a one-time payment course compete with $500/month subscriptions? Turns out, it doesn't compete. It destroys them. Real strategies, real support.",
    rating: 5,
  },
  {
    name: "James T.",
    role: "Recovered from €10k losses",
    avatar: "J",
    quote:
      "After blowing my account twice following 'gurus', I found Abdu Academy. The risk management section saved my trading career. No fluff, just actionable strategies that work.",
    rating: 5,
  },
  {
    name: "Lisa M.",
    role: "Part-time trader, full-time results",
    avatar: "L",
    quote:
      "As a working mom, I needed something I could learn at my own pace. Lifetime access means no pressure. The swing trading strategies are perfect for my schedule. Life-changing!",
    rating: 5,
  },
];

const testimonials2 = [
  {
    name: "Chris P.",
    role: "Former subscription course victim",
    avatar: "C",
    quote:
      "I calculated I spent €7,200 on trading subscriptions over 3 years. €399 one-time? No brainer. And the content is actually better because there's no incentive to drip-feed you basic stuff.",
    rating: 5,
  },
  {
    name: "Anna H.",
    role: "3x my trading account in 8 months",
    avatar: "A",
    quote:
      "The psychology module alone is worth more than the entire price. I finally understand why I was making emotional decisions. Now I trade with a plan and stick to it.",
    rating: 5,
  },
  {
    name: "Robert K.",
    role: "Full-time trader now",
    avatar: "R",
    quote:
      "The 1-on-1 mentorship is the secret weapon. Having someone review your actual trades and point out your mistakes? That's how you actually improve. Can't get that with YouTube videos.",
    rating: 5,
  },
  {
    name: "Sophie B.",
    role: "Saved €5,000+ vs subscriptions",
    avatar: "S",
    quote:
      "Did the math: €399 vs €249/month for a 'premium' course I was considering. After 2 years I would have paid €5,976. Instead, I paid once and got better content. Math doesn't lie.",
    rating: 5,
  },
  {
    name: "Michael D.",
    role: "From complete beginner to confident",
    avatar: "M",
    quote:
      "Started knowing absolutely nothing about forex. The fundamentals chapter gave me such a solid foundation. 6 months later, I'm making consistent profits. The structured approach works.",
    rating: 5,
  },
  {
    name: "Nadia F.",
    role: "Finally stopped revenge trading",
    avatar: "N",
    quote:
      "The mindset training in Day 2 literally changed my life. I went from revenge trading after every loss to calmly following my system. My win rate jumped 20% just from emotional control.",
    rating: 5,
  },
];

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof testimonials)[0];
}) {
  return (
    <div className="w-[350px] md:w-[400px] mx-2">
      <div className="card-elevated rounded-xl p-6 h-full">
        {/* Quote icon */}
        <Quotes className="h-8 w-8 text-primary/30 mb-4" weight="fill" />

        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 text-primary" weight="fill" />
          ))}
        </div>

        {/* Quote */}
        <p className="text-foreground/80 leading-relaxed mb-6 text-sm">
          "{testimonial.quote}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary border border-primary/20">
            {testimonial.avatar}
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">
              {testimonial.name}
            </p>
            <p className="text-xs text-primary">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">

      <div className="container mx-auto px-6 relative z-10 mb-12">
        {/* Section header */}
        <BlurFade delay={0.1} inView>
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-sm text-primary font-medium tracking-widest uppercase mb-4 block">
              Success Stories
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6">
              Real Traders Who Made One Investment and{" "}
              <span className="italic text-muted-foreground">
                Never Looked Back
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Don't just take our word for it — hear from traders who
              transformed their results.
            </p>
          </div>
        </BlurFade>
      </div>

      {/* Marquee rows */}
      <BlurFade delay={0.2} inView>
        <div className="space-y-6">
          {/* First row - left to right */}
          <Marquee pauseOnHover className="[--duration:60s]">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} />
            ))}
          </Marquee>

          {/* Second row - right to left */}
          <Marquee reverse pauseOnHover className="[--duration:60s]">
            {testimonials2.map((testimonial) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} />
            ))}
          </Marquee>
        </div>
      </BlurFade>
    </section>
  );
}
