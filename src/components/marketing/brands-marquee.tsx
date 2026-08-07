import { cn } from "@/lib/utils"

function BrandItem({ name }: { name: string }) {
  return (
    <div className="mx-10 flex shrink-0 items-center">
      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
        {name}
      </span>
    </div>
  )
}

interface BrandsMarqueeProps {
  /** Brand names taken from the attributes sellers set on their live listings. */
  brands: string[]
  className?: string
}

export function BrandsMarquee({ brands, className }: BrandsMarqueeProps) {
  // A marquee of two names reads as a mistake — show it only once the catalogue
  // has enough breadth to scroll.
  if (brands.length < 4) return null

  const doubled = [...brands, ...brands]

  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-white/5 bg-midnight-50/50 py-5",
        className,
      )}
      aria-label="Brands available on Aureon"
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-midnight-50/50 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-midnight-50/50 to-transparent" />

      <div className="flex animate-marquee" aria-hidden="true">
        {doubled.map((brand, i) => (
          <BrandItem key={`${brand}-${i}`} name={brand} />
        ))}
      </div>
    </div>
  )
}
