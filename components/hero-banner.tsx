"use client"

import Link from "next/link"
import { ArrowRight, Users, TrendingUp, ShieldCheck } from "lucide-react"
import { useSession } from "@/lib/auth-client"

// ── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { data: session, isPending } = useSession()

  return (
    <header className="w-full border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.5 18.5L9.5 12.5L13.5 16.5L19 9.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="20" cy="8" r="2" fill="currentColor" />
            </svg>
          </div>
          <span>InvestTracker</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          {["Features", "Portfolio", "Analytics", "Pricing"].map((item) => (
            <Link
              key={item}
              href="#"
              className="hover:text-foreground transition-colors duration-200 flex items-center gap-1"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* CTA — session-aware */}
        {!isPending && (
          <Link
            href={session ? "/dashboard" : "/login"}
            className="h-9 px-5 rounded-full bg-foreground text-background text-sm font-medium flex items-center hover:opacity-85 transition-opacity"
          >
            {session ? "Go to Dashboard" : "Get Started"}
          </Link>
        )}
      </div>
    </header>
  )
}

// ── Stat item ─────────────────────────────────────────────────────────────────
interface StatProps {
  icon: React.ReactNode
  label: string
  sublabel: string
}

const Stat = ({ icon, label, sublabel }: StatProps) => (
  <div className="flex flex-col items-center gap-2 text-center">
    <div className="text-muted-foreground">{icon}</div>
    <p className="text-sm font-medium text-foreground">{label}</p>
    <p className="text-xs text-muted-foreground">{sublabel}</p>
  </div>
)

// ── Hero Banner ───────────────────────────────────────────────────────────────
const HeroBanner = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />

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
