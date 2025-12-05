import type React from "react"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
// import AnnouncementBanner from "@/components/announcement-banner"
import { BeforeInteractiveScripts, AfterInteractiveScripts, LazyScripts } from "@/components/ScriptInjector"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Retoro - Never Miss a Return Deadline Again",
  description: "Track your purchase return windows, get timely reminders, and maximize your refund opportunities. Smart deadline tracking with multi-currency support.",
  icons: {
    icon: "/images/favicon.svg",
  },
  metadataBase: new URL('https://retoro.app'),
  openGraph: {
    title: "Retoro - Never Miss a Return Deadline Again",
    description: "Track your purchase return windows, get timely reminders, and maximize your refund opportunities.",
    url: 'https://retoro.app',
    siteName: 'Retoro',
    images: [
      {
        url: '/images/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Retoro - Smart Return Tracking',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Retoro - Never Miss a Return Deadline Again",
    description: "Track your purchase return windows, get timely reminders, and maximize your refund opportunities.",
    images: ['/images/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Scripts that need to load before page becomes interactive */}
        <BeforeInteractiveScripts />
      </head>
      <body className={inter.className}>
        {/* Scripts that load after page becomes interactive */}
        <AfterInteractiveScripts />
        
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
        
        {/* Scripts that load lazily when page is idle */}
        <LazyScripts />
      </body>
    </html>
  )
}
