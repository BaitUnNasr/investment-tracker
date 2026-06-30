import { Inter, Open_Sans } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import NextTopLoader from "nextjs-toploader"
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-heading' })
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-sans' })

export const metadata = {
  title: "Investment Tracker",
  description:
    "Track investment portfolios, fund allocations, and weekly collections across branches and clients with real-time analytics.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", inter.variable, openSans.variable)}
    >
      <body>
        <NextTopLoader color="#a78bfb" height={3} showSpinner={false} shadow={false} />
        <ThemeProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
