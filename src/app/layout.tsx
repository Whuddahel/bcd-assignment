import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Aureon — Own the Rare",
    template: "%s | Aureon",
  },
  description:
    "Curated luxury watches, art, and rare collectibles — with provenance you can trust. The marketplace for discerning collectors.",
  keywords: ["luxury", "collectibles", "watches", "art", "rare", "authenticated", "marketplace"],
  authors: [{ name: "Aureon" }],
  creator: "Aureon",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://aureon.io",
    siteName: "Aureon",
    title: "Aureon — Own the Rare",
    description:
      "Curated luxury watches, art, and rare collectibles — with provenance you can trust.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aureon — Own the Rare",
    description:
      "Curated luxury watches, art, and rare collectibles — with provenance you can trust.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0118" },
    { media: "(prefers-color-scheme: light)", color: "#f7f6ff" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
