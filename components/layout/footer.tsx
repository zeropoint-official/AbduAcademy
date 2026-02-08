"use client";

import Link from "next/link";
import {
  InstagramLogo,
  TwitterLogo,
  YoutubeLogo,
  WarningCircle,
} from "@phosphor-icons/react";

const socialLinks = [
  { icon: InstagramLogo, href: "#", label: "Instagram" },
  { icon: TwitterLogo, href: "#", label: "Twitter" },
  { icon: YoutubeLogo, href: "#", label: "YouTube" },
];

const footerLinks = [
  { label: "Course", href: "/course" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Refund Policy", href: "#" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-background">
      {/* Blue accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="group inline-flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                <span className="font-display text-base font-medium italic">A</span>
              </div>
              <span className="text-sm font-semibold text-foreground tracking-tight">
                Abdu Academy
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Premium forex trading education. Master the markets with proven
              strategies. One payment. Lifetime access.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-1">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="md:col-span-1">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              Connect
            </h4>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-2.5 rounded-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" weight="bold" />
                </a>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="md:col-span-1">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              Guarantee
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ 30-Day Money-Back</p>
              <p>✓ Secure Checkout</p>
              <p>✓ Lifetime Access</p>
              <p>✓ 1-on-1 Support</p>
            </div>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="p-4 bg-card rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <WarningCircle
                className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5"
                weight="bold"
              />
              <div className="text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Risk Disclaimer:</p>
                <p>
                  Trading forex involves substantial risk of loss and is not
                  suitable for all investors. Past performance is not indicative
                  of future results. The content provided is for educational
                  purposes only and should not be considered financial advice.
                  Always do your own research and consult with a licensed
                  financial advisor. Never trade with money you cannot afford to
                  lose.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-muted-foreground">
            &copy; {currentYear} Abdu Academy. All rights reserved.
          </span>
          <span className="text-xs text-muted-foreground/60 font-mono">
            Built for traders, by traders.
          </span>
        </div>

        {/* Affiliate Disclosure */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-muted-foreground/50">
            This website may contain affiliate links. When you purchase through
            our links, we may earn a commission at no additional cost to you.
          </p>
        </div>
      </div>
    </footer>
  );
}
