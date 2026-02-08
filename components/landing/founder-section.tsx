"use client";

import {
  Play,
  CheckCircle,
  TrendUp,
  Heart,
  Lightning,
} from "@phosphor-icons/react";
import { BlurFade } from "@/components/ui/blur-fade";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";

const storyPoints = [
  "My journey from losing trader to consistently profitable",
  "Why I got fed up with the subscription model",
  "The exact mindset shift that changed everything",
  "What I wish I had when starting out",
  "My trading philosophy and approach",
];

const timestamps = [
  { time: "0:00", label: "Introduction" },
  { time: "2:30", label: "My Trading Journey" },
  { time: "8:15", label: "The Turning Point" },
  { time: "14:00", label: "Why One-Time Payment" },
  { time: "18:30", label: "What You'll Learn" },
];

export function FounderSection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <BlurFade delay={0.1} inView>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm text-primary font-medium tracking-widest uppercase mb-4 block">
              Meet Your Mentor
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6">
              Why I Built a Course That Charges{" "}
              <span className="italic text-muted-foreground">Once</span>, Not
              Forever
            </h2>
          </div>
        </BlurFade>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
          {/* Video Column */}
          <BlurFade delay={0.2} inView>
            <div className="relative">
              <HeroVideoDialog
                videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ"
                thumbnailSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop"
                thumbnailAlt="Founder story video"
                animationStyle="from-center"
                className="rounded-xl overflow-hidden shadow-xl"
              />

              {/* Quick chapters */}
              <div className="mt-6 p-4 bg-card border border-border rounded-lg">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" weight="fill" />
                  Quick Chapters
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {timestamps.map((ts) => (
                    <button
                      key={ts.time}
                      className="text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
                    >
                      <span className="text-primary font-mono">{ts.time}</span>
                      <span className="text-muted-foreground ml-2">
                        {ts.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </BlurFade>

          {/* Content Column */}
          <BlurFade delay={0.3} inView>
            <div>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                I've been where you are—frustrated, losing money, jumping from
                one expensive subscription to another. After years of struggle
                and thousands lost, I finally cracked the code. Now I want to
                share everything I learned, without the endless monthly fees
                that plagued my own journey.
              </p>

              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lightning className="h-5 w-5 text-primary" weight="fill" />
                What You'll Discover in This Video:
              </h4>

              <ul className="space-y-3 mb-8">
                {storyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle
                      className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                      weight="fill"
                    />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>

              {/* Credibility badges */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-card border border-border rounded-lg">
                <div className="text-center">
                  <TrendUp
                    className="h-6 w-6 text-primary mx-auto mb-2"
                    weight="duotone"
                  />
                  <p className="text-xs text-muted-foreground">5+ Years</p>
                  <p className="text-sm font-semibold text-foreground">
                    Trading
                  </p>
                </div>
                <div className="text-center border-x border-border">
                  <Heart
                    className="h-6 w-6 text-primary mx-auto mb-2"
                    weight="duotone"
                  />
                  <p className="text-xs text-muted-foreground">500+</p>
                  <p className="text-sm font-semibold text-foreground">
                    Students
                  </p>
                </div>
                <div className="text-center">
                  <CheckCircle
                    className="h-6 w-6 text-primary mx-auto mb-2"
                    weight="duotone"
                  />
                  <p className="text-xs text-muted-foreground">Proven</p>
                  <p className="text-sm font-semibold text-foreground">
                    Results
                  </p>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
