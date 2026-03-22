"use client"

import Link from "next/link"
import { useSession } from "@/lib/auth-client"
import { Spinner } from "@/components/ui/spinner"

const Header = () => {
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
            <div className="flex w-[120px] justify-center">
               {isPending ?
                  <Spinner /> : (
                     <Link
                        href={session ? "/dashboard" : "/login"}
                        className="h-9 px-5 rounded-full bg-foreground text-background text-sm font-medium flex items-center hover:opacity-85 transition-opacity"
                     >
                        {session ? "Dashboard" : "Get Started"}
                     </Link>
                  )}
            </div>
         </div>
      </header>
   )
}

export default Header