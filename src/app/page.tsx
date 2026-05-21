import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/marketing/hero-section"
import { BrandsMarquee } from "@/components/marketing/brands-marquee"
import { FeaturedCollections } from "@/components/marketing/featured-collections"
import { TrendingDrops } from "@/components/marketing/trending-drops"
import { CategoryShowcase } from "@/components/marketing/category-showcase"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { Testimonials } from "@/components/marketing/testimonials"
import { NewsletterCTA } from "@/components/marketing/newsletter-cta"

export const metadata: Metadata = {
  title: "Aureon — Own the Rare",
  description:
    "Curated luxury watches, art, and rare collectibles — with provenance you can trust. The marketplace for discerning collectors.",
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <BrandsMarquee />
        <FeaturedCollections />
        <TrendingDrops />
        <CategoryShowcase />
        <HowItWorks />
        <Testimonials />
        <NewsletterCTA />
      </main>
      <Footer />
    </>
  )
}
