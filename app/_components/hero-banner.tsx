"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

// ── Hero Banner ───────────────────────────────────────────────────────────────
const HeroBanner = () => (
  <div className="min-h-screen flex flex-col bg-background">

    {/* Hero */}
    <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto w-full">
      {/* Badge */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-8 bg-background">
        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
        Real-time portfolio tracking now available
        <ArrowRight className="w-3 h-3" />
      </span>

      {/* Heading */}
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
        Turn Your Investments
        <br />
        Into{" "}
        <span className="relative inline-block">
          <span className="relative z-10">Smart Returns</span>
          <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/20 -z-0 rounded" />
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
        Get crystal-clear insights into your portfolio. Track performance, analyse
        trends, and make smarter decisions with powerful real-time analytics.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-20">
        <Link
          href="/dashboard"
          className="h-12 px-7 rounded-full bg-foreground text-background font-medium flex items-center gap-2 hover:opacity-85 transition-opacity text-sm"
        >
          Start Tracking now <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="#"
          className="h-12 px-7 rounded-full border border-border text-foreground font-medium flex items-center gap-2 hover:bg-muted transition-colors text-sm"
        >
          View demo
        </Link>
      </div>
    </main>
  </div>
)

export default HeroBanner
