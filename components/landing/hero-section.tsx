"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "@phosphor-icons/react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { WordRotate } from "@/components/ui/word-rotate";
import { BlurFade } from "@/components/ui/blur-fade";

const painRotation = [
  "losing money",
  "blowing accounts",
  "chasing signals",
  "paying gurus",
];

const stats = [
  { value: 30, label: "Students", suffix: "+" },
  { value: 12, label: "Hours Content", suffix: "h+" },
  { value: 100, label: "Generated", prefix: "€", suffix: "k+" },
];

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="relative min-h-[90vh] overflow-hidden">

      {/* Abstract trading background — minimal, geometric, premium */}
      <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">

        {/* ── Desktop SVG (md+) ── */}
        <svg
          className="absolute inset-0 w-full h-full hidden md:block"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
              <stop offset="20%" stopColor="#60a5fa" stopOpacity="0.4" />
              <stop offset="80%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ascending curve */}
          <path
            d="M-50,680 C200,650 300,620 450,550 C600,480 650,520 750,440 C850,360 900,380 1000,280 C1100,180 1200,200 1300,120 C1400,40 1480,60 1550,20"
            stroke="url(#curveGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            filter="url(#lineGlow)"
            className="animate-draw-line"
          />
          <path
            d="M-50,680 C200,650 300,620 450,550 C600,480 650,520 750,440 C850,360 900,380 1000,280 C1100,180 1200,200 1300,120 C1400,40 1480,60 1550,20 L1550,900 L-50,900 Z"
            fill="url(#areaFill)"
          />

          {/* Candlestick group 1 — bottom left */}
          <g opacity="0.07" transform="translate(120, 520)">
            <rect x="0" y="20" width="8" height="35" rx="1" stroke="#ef4444" strokeWidth="1" fill="none" />
            <line x1="4" y1="0" x2="4" y2="65" stroke="#ef4444" strokeWidth="0.5" />
          </g>
          <g opacity="0.07" transform="translate(140, 490)">
            <rect x="0" y="15" width="8" height="40" rx="1" stroke="#22c55e" strokeWidth="1" fill="none" />
            <line x1="4" y1="0" x2="4" y2="70" stroke="#22c55e" strokeWidth="0.5" />
          </g>
          <g opacity="0.07" transform="translate(160, 460)">
            <rect x="0" y="10" width="8" height="45" rx="1" stroke="#22c55e" strokeWidth="1" fill="none" />
            <line x1="4" y1="0" x2="4" y2="65" stroke="#22c55e" strokeWidth="0.5" />
          </g>

          {/* Candlestick group 2 — top right */}
          <g opacity="0.06" transform="translate(1150, 140)">
            <rect x="0" y="18" width="10" height="50" rx="1" stroke="#22c55e" strokeWidth="1" fill="none" />
            <line x1="5" y1="0" x2="5" y2="80" stroke="#22c55e" strokeWidth="0.5" />
          </g>
          <g opacity="0.06" transform="translate(1175, 120)">
            <rect x="0" y="12" width="10" height="55" rx="1" stroke="#22c55e" strokeWidth="1" fill="none" />
            <line x1="5" y1="0" x2="5" y2="80" stroke="#22c55e" strokeWidth="0.5" />
          </g>
          <g opacity="0.05" transform="translate(1200, 150)">
            <rect x="0" y="20" width="10" height="35" rx="1" stroke="#ef4444" strokeWidth="1" fill="none" />
            <line x1="5" y1="0" x2="5" y2="70" stroke="#ef4444" strokeWidth="0.5" />
          </g>

          {/* Candlestick group 3 — centre */}
          <g opacity="0.04" transform="translate(700, 350)">
            <rect x="0" y="15" width="8" height="30" rx="1" stroke="#60a5fa" strokeWidth="0.8" fill="none" />
            <line x1="4" y1="0" x2="4" y2="55" stroke="#60a5fa" strokeWidth="0.4" />
          </g>
          <g opacity="0.04" transform="translate(720, 330)">
            <rect x="0" y="10" width="8" height="35" rx="1" stroke="#60a5fa" strokeWidth="0.8" fill="none" />
            <line x1="4" y1="0" x2="4" y2="55" stroke="#60a5fa" strokeWidth="0.4" />
          </g>

          {/* Intersection dots */}
          {[
            [450, 550], [750, 440], [1000, 280], [1300, 120]
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="16" fill="url(#dotGlow)" opacity="0.5">
                <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" begin={`${i * 0.7}s`} />
              </circle>
              <circle cx={cx} cy={cy} r="2.5" fill="#60a5fa" opacity="0.7">
                <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" begin={`${i * 0.7}s`} />
              </circle>
            </g>
          ))}

          {/* Level lines */}
          <line x1="350" y1="550" x2="650" y2="550" stroke="#60a5fa" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.1" />
          <line x1="850" y1="280" x2="1150" y2="280" stroke="#60a5fa" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.08" />
          <line x1="600" y1="440" x2="900" y2="440" stroke="#60a5fa" strokeWidth="0.5" strokeDasharray="2 8" opacity="0.06" />
        </svg>

        {/* ── Mobile: 2 horizontal trend lines ── */}
        <svg
          className="absolute inset-0 w-full h-full md:hidden"
          viewBox="0 0 400 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="lineGlowM" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="curveGradM1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
              <stop offset="30%" stopColor="#60a5fa" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="curveGradM2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
              <stop offset="25%" stopColor="#60a5fa" stopOpacity="0.35" />
              <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="dotGlowM" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Trend line 1 — upper third, flows left to right */}
          <path
            d="M-30,300 C80,280 120,250 200,200 C280,150 300,170 380,100"
            stroke="url(#curveGradM1)"
            strokeWidth="1.5"
            strokeLinecap="round"
            filter="url(#lineGlowM)"
            className="animate-draw-line"
            opacity="0.7"
          />

          {/* Dots on trend line 1 — aligned with curve points */}
          {[
            [100, 265], [200, 200], [290, 160]
          ].map(([cx, cy], i) => (
            <g key={`line1-${i}`}>
              <circle cx={cx} cy={cy} r="12" fill="url(#dotGlowM)" opacity="0.45">
                <animate attributeName="opacity" values="0.25;0.5;0.25" dur="3s" repeatCount="indefinite" begin={`${i * 0.7}s`} />
              </circle>
              <circle cx={cx} cy={cy} r="2" fill="#60a5fa" opacity="0.7">
                <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" begin={`${i * 0.7}s`} />
              </circle>
            </g>
          ))}

          {/* Trend line 2 — lower section, flows left to right */}
          <path
            d="M-20,850 C90,820 140,780 220,720 C300,660 320,680 400,600"
            stroke="url(#curveGradM2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            filter="url(#lineGlowM)"
            className="animate-draw-line"
            opacity="0.6"
            style={{ animationDelay: '1s' }}
          />

          {/* Dots on trend line 2 — aligned with curve points */}
          {[
            [100, 800], [220, 720], [310, 660]
          ].map(([cx, cy], i) => (
            <g key={`line2-${i}`}>
              <circle cx={cx} cy={cy} r="12" fill="url(#dotGlowM)" opacity="0.45">
                <animate attributeName="opacity" values="0.25;0.5;0.25" dur="3s" repeatCount="indefinite" begin={`${1 + i * 0.7}s`} />
              </circle>
              <circle cx={cx} cy={cy} r="2" fill="#60a5fa" opacity="0.7">
                <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" begin={`${1 + i * 0.7}s`} />
              </circle>
            </g>
          ))}
        </svg>
      </div>

      <div className="container mx-auto px-6 pt-24 pb-16 lg:pt-32 lg:pb-24 relative z-10">
        {/* Top Row: Title/Subtitle (Left) | Video (Right) */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-12">
          {/* Left Column - Title & Subtitle */}
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <BlurFade delay={0.1} inView>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-primary/10 border border-primary/20 text-primary text-xs font-medium tracking-widest uppercase mb-8">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                One-Time Payment • Lifetime Access
              </span>
            </BlurFade>

            {/* Main headline - Line 1: Pain with rotation */}
            <BlurFade delay={0.2} inView>
              <div className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-medium tracking-wide uppercase mb-3 flex items-center gap-2 flex-wrap">
                <span>Stop</span>
                <WordRotate
                  words={painRotation}
                  className="inline-block text-red-400 font-semibold"
                  duration={2000}
                />
                <span className="text-muted-foreground/60">—</span>
              </div>
            </BlurFade>

            {/* Main headline - Line 2: Solution (big & bold) */}
            <BlurFade delay={0.45} inView>
              <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-tight mb-6">
                Start Trading{" "}
                <span className="text-gradient-gold">like institutions</span>
              </h1>
            </BlurFade>

            {/* Value proposition */}
            <BlurFade delay={0.6} inView>
              <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
                Get{" "}
                <span className="text-foreground font-medium">
                  lifetime access
                </span>{" "}
                to a complete trading system with live trading, 1-on-1
                mentorship, and real strategies—for{" "}
                <span className="text-foreground font-medium">one payment</span>
                . No recurring fees. No basic fluff. Just results.
              </p>
            </BlurFade>
          </div>

          {/* Right Column - Video */}
          <BlurFade delay={0.5} inView direction="left">
            <div className="relative lg:pt-16">
              <div className="relative rounded-lg overflow-hidden shadow-2xl border border-border/50 bg-black/50 backdrop-blur-sm">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 rounded-lg blur-xl opacity-50" />
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full aspect-video object-contain cursor-pointer bg-black"
                    onClick={togglePlay}
                    onEnded={() => { setIsPlaying(false); setShowControls(true); }}
                    onPlay={() => { setIsPlaying(true); setShowControls(false); }}
                    onPause={() => { setIsPlaying(false); setShowControls(true); }}
                    playsInline
                    preload="metadata"
                    poster="/hf_20260207_102534_52b1297a-ac7a-47e8-8b5b-6a034ad8b1ac.png"
                  >
                    <source src="https://pub-c16cfda790dc4841b59ca23daaa41898.r2.dev/videos/AbduVid.mov" type="video/quicktime" />
                    <source src="https://pub-c16cfda790dc4841b59ca23daaa41898.r2.dev/videos/AbduVid.mov" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 cursor-pointer ${
                      showControls || !isPlaying ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                    }`}
                    onClick={togglePlay}
                  >
                    <div className={`transform transition-all duration-300 ${isPlaying ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform">
                        <Play className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground ml-0.5" weight="fill" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-lg -z-10" />
              <div className="absolute -top-4 -left-4 w-16 h-16 border-2 border-primary/30 rounded-lg -z-10" />
            </div>
          </BlurFade>
        </div>

        {/* Bottom Row: Pricing, CTAs, Stats (Centered) */}
        <div className="max-w-4xl mx-auto">
          {/* Price anchor */}
          <BlurFade delay={0.7} inView>
            <div className="flex items-center gap-4 mb-8 p-4 rounded-lg bg-card border border-border">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground line-through">
                    €200/month forever
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">
                      €400
                    </span>
                    <span className="text-primary font-medium">once</span>
                  </div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="text-sm text-muted-foreground">
                  <span className="text-success font-semibold">Lifetime Access</span>
                  <br />
                  One payment, forever updates
                </div>
            </div>
          </BlurFade>

          {/* CTAs */}
          <BlurFade delay={0.8} inView>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link href="/payment">
                <ShimmerButton
                  shimmerColor="#3b82f6"
                  shimmerSize="0.1em"
                  background="linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
                  borderRadius="8px"
                  className="h-14 px-8 text-base font-semibold gap-3"
                >
                  Get Lifetime Access Now
                  <ArrowRight className="h-5 w-5" weight="bold" />
                </ShimmerButton>
              </Link>
              <button className="h-14 px-8 text-base font-medium gap-3 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center justify-center">
                <Play className="h-5 w-5" weight="fill" />
                Watch Preview
              </button>
            </div>
          </BlurFade>

          {/* Stats */}
          <BlurFade delay={0.9} inView>
            <div className="flex gap-8 md:gap-12 justify-center">
              {stats.map((stat, index) => (
                <div key={stat.label} className="relative">
                  <div className="flex items-baseline gap-0.5">
                    {stat.prefix && (
                      <span className="font-mono text-xl md:text-2xl text-primary">
                        {stat.prefix}
                      </span>
                    )}
                    <NumberTicker
                      value={stat.value}
                      className="font-mono text-3xl md:text-4xl font-semibold text-foreground"
                    />
                    {stat.suffix && (
                      <span className="font-mono text-xl md:text-2xl text-primary">
                        {stat.suffix}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  {index < stats.length - 1 && (
                    <div className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 h-10 w-px bg-border hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </BlurFade>
        </div>
      </div>

    </section>
  );
}
