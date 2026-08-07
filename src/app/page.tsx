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
import { getProducts, getTrendingProducts } from "@/lib/data/products"
import { getHomeData } from "@/lib/data/home"

export const metadata: Metadata = {
  title: "Aureon — Own the Rare",
  description:
    "Curated luxury watches, art, and rare collectibles — with provenance you can trust. The marketplace for discerning collectors.",
}

export default async function HomePage() {
  const [home, trending] = await Promise.all([getHomeData(), getTrendingProducts(4)])

  // Nothing flagged as trending yet — fall back to the newest listings so the
  // rail still says something true about the catalogue instead of vanishing.
  const drops =
    trending.length > 0 ? trending : await getProducts({ sort: "newest", limit: 4 })

  return (
    <>
      <Header />
      <main>
        <HeroSection
          stats={home.stats}
          ticker={home.ticker}
          cards={home.heroCards}
          latestSale={home.latestSale}
        />
        <BrandsMarquee brands={home.brands} />
        <FeaturedCollections collections={home.collections} />
        {drops.length > 0 && <TrendingDrops drops={drops} />}
        <CategoryShowcase categories={home.categories} />
        <HowItWorks />
        <Testimonials testimonials={home.testimonials} />
        <NewsletterCTA subscriberCount={home.subscriberCount} />
      </main>
      <Footer />
    </>
  )
}
