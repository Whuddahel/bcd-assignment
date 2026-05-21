import Link from "next/link"
import { AureonLogo } from "@/components/brand/aureon-logo"
import { Separator } from "@/components/ui/separator"

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/>
    </svg>
  )
}

function IconYoutube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

const links = {
  Marketplace: [
    { label: "Browse All",       href: "/browse" },
    { label: "Watches",          href: "/browse?category=watches" },
    { label: "Fine Art",         href: "/browse?category=art" },
    { label: "Designer Pieces",  href: "/browse?category=designer" },
    { label: "Trending Drops",   href: "/browse?sort=trending" },
  ],
  Sellers: [
    { label: "Become a Seller",  href: "/seller/apply" },
    { label: "Seller Dashboard", href: "/seller" },
    { label: "All Sellers",      href: "/sellers" },
    { label: "Pricing & Fees",   href: "/#how-it-works" },
  ],
  Company: [
    { label: "About Aureon",     href: "/about" },
    { label: "How It Works",     href: "/#how-it-works" },
    { label: "Press",            href: "/press" },
    { label: "Careers",          href: "/careers" },
    { label: "Contact",          href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms" },
    { label: "Cookie Policy",    href: "/legal/cookies" },
    { label: "Authenticity",     href: "/legal/authenticity" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-midnight-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Top */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <AureonLogo size="md" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The premier marketplace for authenticated luxury collectibles. Every item
              verified, every provenance tracked.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Aureon on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
              >
                <IconInstagram className="h-4 w-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Aureon on X"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
              >
                <IconX className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Aureon on YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground"
              >
                <IconYoutube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {section}
              </h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10 bg-white/5" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Aureon Inc. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60">
            ✦ Provenance-powered by blockchain —{" "}
            <span className="text-violet-400/80">coming Phase 2</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
